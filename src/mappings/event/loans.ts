import { Deposit, Loan, LoanMarket, LoanMarketActivation, MarketState } from "../../model";
import { SubstrateBlock } from "@subsquid/substrate-processor";
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
    LoansWithdrawCollateralEvent
} from "../../types/events";

import {
    CurrencyId as CurrencyId_V1020000,
    CurrencyId_LendToken
} from "../../types/v1020000";

import { CurrencyId as CurrencyId_V1021000,
    Market as LoanMarket_V1021000
} from "../../types/v1021000";

import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { friendlyAmount, getFirstAndLastFour } from "../_utils";
import { lendTokenDetails } from "../utils/markets";

import { address, currencyId, currencyToString, rateModel } from "../encoding";

export async function newMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansNewMarketEvent(ctx, item.event);
    let e;
    let underlyingCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let market: LoanMarket_V1021000;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        underlyingCurrencyId = e.underlyingCurrencyId;
        market = e.market;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansNewMarketEvent`);
        return;
    }

    const currency = currencyId.encode(underlyingCurrencyId);
    const id = currencyToString(currency);
    const InterestRateModel = rateModel.encode(market.rateModel)

    const height = await blockToHeight(ctx, block.height, "NewMarket");
    const timestamp = new Date(block.timestamp);
    const lendTokenIdNo = (market.lendTokenId as CurrencyId_LendToken).value;

    const my_market = new LoanMarket({
        id: `loanMarket_` + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: market.borrowCap,
        supplyCap: market.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: market.closeFactor,
        lendTokenId: lendTokenIdNo,
        state: MarketState.Pending,
        reserveFactor: market.reserveFactor,
        collateralFactor: market.collateralFactor,
        liquidateIncentive: market.liquidateIncentive,
        liquidationThreshold: market.liquidationThreshold,
        liquidateIncentiveReservedFactor: market.liquidateIncentiveReservedFactor
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
    let e;
    let underlyingCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let market: LoanMarket_V1021000;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        underlyingCurrencyId = e.underlyingCurrencyId;
        market = e.market;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansUpdatedMarketEvent`);
        return;
    }

    const currency = currencyId.encode(underlyingCurrencyId);
    const id = currencyToString(currency);
    const InterestRateModel = rateModel.encode(market.rateModel)

    const height = await blockToHeight(ctx, block.height, "UpdatedMarket");
    const timestamp = new Date(block.timestamp);
    const lendTokenIdNo = (market.lendTokenId as CurrencyId_LendToken).value;

    const my_market = new LoanMarket({
        id: `loanMarket_` + id, //lendTokenId.toString(),
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: market.borrowCap,
        supplyCap: market.supplyCap,
        rateModel: InterestRateModel,
        closeFactor: market.closeFactor,
        lendTokenId: lendTokenIdNo,
        reserveFactor: market.reserveFactor,
        collateralFactor: market.collateralFactor,
        liquidateIncentive: market.liquidateIncentive,
        liquidationThreshold: market.liquidationThreshold,
        liquidateIncentiveReservedFactor: market.liquidateIncentiveReservedFactor
    });

    my_market.state =
        market.state.__kind === "Supervision"
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
    let e;
    let underlyingCurrencyId: CurrencyId_V1021000;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        underlyingCurrencyId = e.underlyingCurrencyId;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansActivatedMarketEvent`);
        return;
    }

    const currency = currencyId.encode(underlyingCurrencyId);
    const id = currencyToString(currency);

    const marketDb = await ctx.store.get(LoanMarket, {
        where: { id: `loanMarket_${id}` },
    });
    if (marketDb === undefined) {
        ctx.log.warn(
            "WARNING: ActivatedMarket event did not match any existing LoanMarkets! Skipping."
        );
        return;
    }
    const height = await blockToHeight(ctx, block.height, "ActivatedMarket");
    const activation = new LoanMarketActivation({
        id: marketDb.id,
        market: marketDb,
        token: currency,
        height,
        timestamp: new Date(block.timestamp),
    });
    marketDb.state = MarketState.Active
    marketDb.activation = activation;
    await entityBuffer.pushEntity(LoanMarketActivation.name, activation);
    await entityBuffer.pushEntity(LoanMarket.name, marketDb);

    console.log(`Activated ${marketDb.id}`);
}

export async function borrow(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansBorrowedEvent(ctx, item.event);
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansBorrowedEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "LoansBorrowed");
    const account = address.interlay.encode(accountId);
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
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansDepositCollateralEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "Deposit");
    const account = address.interlay.encode(accountId);
    let comment;
    if(currency.isTypeOf==='LendToken'){
        const newToken = await lendTokenDetails(ctx, currency.lendTokenId)
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
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansDepositCollateralEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "WithdrawDeposit");
    const account = address.interlay.encode(accountId);
    let comment ='';
    if(currency.isTypeOf==='LendToken'){
        const newToken = await lendTokenDetails(ctx, currency.lendTokenId)
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
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansDepositedEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "Deposit");
    const account = address.interlay.encode(accountId);
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
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansRepaidBorrowEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "LoansRepaid");
    const account = address.interlay.encode(accountId);
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
    let accountId: Uint8Array;
    let myCurrencyId: CurrencyId_V1020000|CurrencyId_V1021000;
    let amount: bigint;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        accountId = e.accountId;
        myCurrencyId = e.currencyId;
        amount = e.amount;
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansRepaidBorrowEvent`);
        return;
    }
    const currency = currencyId.encode(myCurrencyId);
    const height = await blockToHeight(ctx, block.height, "Redeemed");
    const account = address.interlay.encode(accountId);
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
