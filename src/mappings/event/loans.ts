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
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    LoansBorrowedEvent,
    LoansDepositCollateralEvent,
    LoansDepositedEvent,
    LoansDistributedBorrowerRewardEvent,
    LoansDistributedSupplierRewardEvent,
    LoansNewMarketEvent,
    LoansRedeemedEvent,
    LoansRepaidBorrowEvent,
    LoansWithdrawCollateralEvent,
    LoansActivatedMarketEvent,
    LoansUpdatedMarketEvent,
} from "../../types/events";
import { CurrencyId_Token as CurrencyId_Token_V6 } from "../../types/v6";
import { CurrencyId_Token as CurrencyId_Token_V10 } from "../../types/v10";
import { CurrencyId_Token as CurrencyId_Token_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { CurrencyId as CurrencyId_V1020000 } from "../../types/v1020000";
import { InterestRateModel as InterestRateModel_V1020000 } from "../../types/v1020000";
import { address, currencyId, currencyToString, legacyCurrencyId, rateModel } from "../encoding";
import {
    updateCumulativeVolumes,
    updateCumulativeVolumesForCurrencyPair,
} from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { getCurrentRedeemPeriod } from "../utils/requestPeriods";
import { getVaultId, getVaultIdLegacy } from "../_utils";
import { LoanMarket} from "../../model/generated/loanMarket.model";
import { Loan } from "../../model/generated/loan.model";
import { Deposit } from "../../model/generated/deposit.model";
import {Currency, currencySymbol} from "../../model/generated/_currency"



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
    const lendTokenId = e.lendTokenId.value;

    const my_market = new LoanMarket({
        id: "loanMarket_" + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: e.borrowCap,
        supplyCap: e.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: e.closeFactor,
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
    const lendTokenId = e.lendTokenId.value;

    const my_market = new LoanMarket({
        id: "loanMarket_" + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: e.borrowCap,
        supplyCap: e.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: e.closeFactor,
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
    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountBorrowed: amount,
        })
    );
    console.log(`${account} borrowed ${amount} ${currencySymbol(currency)}`);
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
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountDeposited: amount,
        })
    );
    console.log(`${account} deposited ${amount} ${currencySymbol(currency)} for collateral`);
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
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountWithdrawn: amount,
        })
    );
    console.log(`${account} withdrew ${amount} ${currencySymbol(currency)} from collateral`);
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
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountDeposited: amount,
        })
    );
    console.log(`${account} deposited ${amount} ${currencySymbol(currency)} for lending`);
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
    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountRepaid: amount,
        })
    );
    console.log(`${account} paid back ${amount} ${currencySymbol(currency)}`);
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
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountWithdrawn: amount, // expand to 3 tokens: qToken, Token, equivalent in USD(T)
        })
    );
    console.log(`${account} withdrew ${amount} ${currencySymbol(currency)} from deposit`);
}
