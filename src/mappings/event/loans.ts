import { SubstrateBlock, toHex } from "@subsquid/substrate-processor";
import { LessThanOrEqual } from "typeorm";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    LendToken,
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemPeriod,
    RedeemRequest,
    RedeemStatus,
    RelayedBlock,
    Transfer,
    VolumeType,
    MarketState,
    LoanMarket,
    LoanMarketActivation,
    Loan,
    Deposit,
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    LoansActivatedMarketEvent,
    LoansBorrowedEvent,
    LoansDepositCollateralEvent,
    LoansDepositedEvent,
    LoansDistributedBorrowerRewardEvent,
    LoansDistributedSupplierRewardEvent,
    LoansNewMarketEvent,
    LoansRedeemedEvent,
    LoansRepaidBorrowEvent,
    LoansUpdatedMarketEvent,
    LoansWithdrawCollateralEvent,

} from "../../types/events";
import { CurrencyId_Token as CurrencyId_Token_V6 } from "../../types/v6";
import { CurrencyId_Token as CurrencyId_Token_V10 } from "../../types/v10";
import { CurrencyId_Token as CurrencyId_Token_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { CurrencyId as CurrencyId_V1020000, CurrencyId_LendToken } from "../../types/v1020000";
import { InterestRateModel as InterestRateModel_V1021000 } from "../../types/v1021000";
import { address, currencyId, currencyToString, legacyCurrencyId, rateModel } from "../encoding";
import {
    updateCumulativeVolumes,
    updateCumulativeVolumesForCurrencyPair,
} from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { getCurrentRedeemPeriod } from "../utils/requestPeriods";
import { getVaultId, getVaultIdLegacy } from "../_utils";
import {Currency} from "../../model/generated/_currency"
import { lendTokenDetails } from "../utils/markets";
import { getFirstAndLastFour, friendlyAmount } from "../_utils"


export async function newMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansNewMarketEvent(ctx, item.event);
    let [token, e] = rawEvent.asV1020000;
    const currency = currencyId.encode(token);
    const id = currencyToString(currency);
    const InterestRateModel = rateModel.encode(e.rateModel)

    const height = await blockToHeight(ctx, block.height, "NewMarket");
    const timestamp = new Date(block.timestamp);
    const lendTokenIdNo = (e.lendTokenId as CurrencyId_LendToken).value;

    const my_market = new LoanMarket({
        id: `loanMarket_` + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: e.borrowCap,
        supplyCap: e.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: e.closeFactor,
        lendTokenId: lendTokenIdNo,
        state: MarketState.Pending,
        reserveFactor: e.reserveFactor,
        collateralFactor: e.collateralFactor,
        liquidateIncentive: e.liquidateIncentive,
        liquidationThreshold: e.liquidationThreshold,
        liquidateIncentiveReservedFactor: e.liquidateIncentiveReservedFactor
    });
    // console.log(JSON.stringify(my_market));
    await entityBuffer.pushEntity(LoanMarket.name, my_market);
}

// Updated market just adds new market with same id (replacing newMarket)
export async function updatedMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansUpdatedMarketEvent(ctx, item.event);
    let [token, e] = rawEvent.asV1020000;
    const currency = currencyId.encode(token);
    const id = currencyToString(currency);
    const InterestRateModel = rateModel.encode(e.rateModel)

    const height = await blockToHeight(ctx, block.height, "UpdatedMarket");
    const timestamp = new Date(block.timestamp);
    const lendTokenIdNo = (e.lendTokenId as CurrencyId_LendToken).value;

    const my_market = new LoanMarket({
        id: `loanMarket_` + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: e.borrowCap,
        supplyCap: e.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: e.closeFactor,
        lendTokenId: lendTokenIdNo,
        reserveFactor: e.reserveFactor,
        collateralFactor: e.collateralFactor,
        liquidateIncentive: e.liquidateIncentive,
        liquidationThreshold: e.liquidationThreshold,
        liquidateIncentiveReservedFactor: e.liquidateIncentiveReservedFactor
    });

    my_market.state =
        e.state.__kind === "Supervision"
            ? MarketState.Supervision
            : MarketState.Pending;

    // console.log(JSON.stringify(my_market));
    await entityBuffer.pushEntity(LoanMarket.name, my_market);

    console.log(`Updated ${my_market.id}`);
}

export async function activatedMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansActivatedMarketEvent(ctx, item.event);
    let token = rawEvent.asV1020000;
    const currency = currencyId.encode(token);
    const id = currencyToString(currency);

    const market = await ctx.store.get(LoanMarket, {
        where: { id: `loanMarket_${id}` },
    });
    if (market === undefined) {
        ctx.log.warn(
            "WARNING: ActivatedMarket event did not match any existing LoanMarkets! Skipping."
        );
        return;
    }
    const height = await blockToHeight(ctx, block.height, "ActivatedMarket");
    const activation = new LoanMarketActivation({
        id: market.id,
        market: market,
        token: currency,
        height,
        timestamp: new Date(block.timestamp),
    });
    market.state = MarketState.Active
    market.activation = activation;
    await entityBuffer.pushEntity(LoanMarketActivation.name, activation);
    await entityBuffer.pushEntity(LoanMarket.name, market);

    console.log(`Activated ${market.id}`);
}

export async function borrow(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansBorrowedEvent(ctx, item.event);
    const [adress, currencyOfLoan, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(currencyOfLoan);
    const height = await blockToHeight(ctx, block.height, "LoansBorrowed");
    const account = address.interlay.encode(adress);
    const comment = `${getFirstAndLastFour(account)} borrowed ${await friendlyAmount(currency, Number(amount))}`;
    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountBorrowed: amount,
            comment: comment
        })
    );
}

export async function depositCollateral(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansDepositCollateralEvent(ctx, item.event);
    const [adress, depositCurr, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(depositCurr);
    const height = await blockToHeight(ctx, block.height, "Deposit");
    const account = address.interlay.encode(adress);
    let comment = '';
    if(depositCurr.__kind==='LendToken'){
        const newToken = await lendTokenDetails(ctx, depositCurr.value)
        const newAmount = Number(amount) * 0.02
        if(newToken){
            comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(newToken, newAmount)} for collateral`
        }
    } else {
        comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(currency, Number(amount))} for collateral`
    }
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountDeposited: amount,
            comment: comment
        })
    );
}

export async function withdrawCollateral(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansWithdrawCollateralEvent(ctx, item.event);
    const [adress, depositCurr, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(depositCurr);
    const height = await blockToHeight(ctx, block.height, "WithdrawDeposit");
    const account = address.interlay.encode(adress);
    let comment = '';
    if(depositCurr.__kind==='LendToken'){
        const newToken = await lendTokenDetails(ctx, depositCurr.value)
        const newAmount = Number(amount) * 0.02
        if(newToken){
            comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(newToken, newAmount)} from collateral`;
        }
    } else {
        comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(currency, Number(amount))} from collateral`;
    }
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountWithdrawn: amount,
            comment: comment
        })
    );
}

export async function depositForLending(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansDepositedEvent(ctx, item.event);
    const [adress, depositCurr, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(depositCurr);
    const height = await blockToHeight(ctx, block.height, "Deposit");
    const account = address.interlay.encode(adress);
    const comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(currency, Number(amount))} for lending`;
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountDeposited: amount,
            comment: comment
        })
    );
}

export async function distributeBorrowerReward(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansDistributedBorrowerRewardEvent(ctx, item.event);
}

export async function distributeSupplierReward(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansDistributedSupplierRewardEvent(ctx, item.event);
}

export async function repay(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansRepaidBorrowEvent(ctx, item.event);
    const [adress, currencyOfLoan, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(currencyOfLoan);
    const height = await blockToHeight(ctx, block.height, "LoansRepaid");
    const account = address.interlay.encode(adress);
    const comment = `${getFirstAndLastFour(account)} paid back ${await friendlyAmount(currency, Number(amount))}`
    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountRepaid: amount,
            comment: comment
        })
    );
}

"Redeem means withdrawing a deposit by redeeming qTokens for Tokens."
export async function withdrawDeposit(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansRedeemedEvent(ctx, item.event);
    const [adress, currencyOfLoan, amount] = rawEvent.asV1020000;
    const currency = currencyId.encode(currencyOfLoan);
    const height = await blockToHeight(ctx, block.height, "Redeemed");
    const account = address.interlay.encode(adress);
    const comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(currency, Number(amount))} from deposit`;
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountWithdrawn: amount,
            comment: comment// expand to 3 tokens: qToken, Token, equivalent in USD(T)
        })
    );
}
