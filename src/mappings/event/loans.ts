import { SubstrateBlock } from "@subsquid/substrate-processor";
import {
    Currency,
    Deposit,
    InterestAccrual,
    Loan,
    LoanLiquidation,
    LoanMarket,
    LoanMarketActivation,
    MarketState
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    LoansActivatedMarketEvent,
    LoansBorrowedEvent,
    LoansDepositCollateralEvent,
    LoansDepositedEvent,
    LoansDistributedBorrowerRewardEvent,
    LoansDistributedSupplierRewardEvent,
    LoansInterestAccruedEvent,
    LoansLiquidatedBorrowEvent,
    LoansNewMarketEvent,
    LoansRedeemedEvent,
    LoansRepaidBorrowEvent,
    LoansUpdatedMarketEvent,
    LoansWithdrawCollateralEvent
} from "../../types/events";

import {
    CurrencyId_LendToken,
    CurrencyId as CurrencyId_V1020000
} from "../../types/v1020000";

import {
    CurrencyId as CurrencyId_V1021000,
    Market as LoanMarket_V1021000
} from "../../types/v1021000";

import { newMonetaryAmount } from "@interlay/interbtc-api";
import { Bitcoin } from "@interlay/monetary-js";
import { Big } from "big.js";
import { BigDecimal } from "@subsquid/big-decimal";
import {
    currencyToLibCurrencyExt,
    decimalsFromCurrency,
    divideByTenToTheNth,
    friendlyAmount,
    getExchangeRate,
    getFirstAndLastFour,
    symbolFromCurrency,
    truncateTimestampToDate
} from "../_utils";
import { address, currencyId, currencyToString, rateModel } from "../encoding";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { lendTokenDetails } from "../utils/markets";

// https://github.com/paritytech/substrate/blob/8ae4738bd7ee57556ea42c33600dc95488b58db6/primitives/arithmetic/src/fixed_point.rs#L2200
const FIXEDI128_SCALING_FACTOR = 18;
// https://github.com/paritytech/substrate/blob/8ae4738bd7ee57556ea42c33600dc95488b58db6/primitives/arithmetic/src/per_things.rs#L1881
const PERMILL_BASE = 1000000;

type Rate = {
    block: number;
    symbol: string;
    rate: number;
};

class BlockRates {
    rates: Rate[] = [];

    addRate(block: number, symbol: string, rate: number) {
        this.rates.push({ block, symbol, rate });
    }

    getRate(block: number, symbol: string): Rate {
        for (let i = this.rates.length - 1; i >= 0; i--) {
            if (this.rates[i].symbol === symbol) {
                if (this.rates[i].block <= block) {
                    return this.rates[i];
                }
            }
        }
        console.log(`Returning default rate for ${symbol}`);
        return {block: block, symbol: symbol, rate: 0.02};
    }
}

const cachedRates = new BlockRates();

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
    const decimals = await decimalsFromCurrency(currency);
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
        borrowCap: divideByTenToTheNth(market.borrowCap, decimals),
        supplyCap: divideByTenToTheNth(market.supplyCap, decimals),
        rateModel: InterestRateModel,
        closeFactor: market.closeFactor / PERMILL_BASE,
        lendTokenId: lendTokenIdNo,
        state: MarketState.Pending,
        reserveFactor: market.reserveFactor / PERMILL_BASE,
        collateralFactor: market.collateralFactor / PERMILL_BASE,
        liquidateIncentive: divideByTenToTheNth(market.liquidateIncentive, FIXEDI128_SCALING_FACTOR),
        liquidationThreshold: market.liquidationThreshold / PERMILL_BASE,
        liquidateIncentiveReservedFactor: market.liquidateIncentiveReservedFactor / PERMILL_BASE,
        currencySymbol: await symbolFromCurrency(currency)
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
    const decimals = await decimalsFromCurrency(currency);
    const id = currencyToString(currency);
    const InterestRateModel = rateModel.encode(market.rateModel)

    const height = await blockToHeight(ctx, block.height, "UpdatedMarket");
    const timestamp = new Date(block.timestamp);
    const lendTokenIdNo = (market.lendTokenId as CurrencyId_LendToken).value;

    const my_market = new LoanMarket({
        id: `loanMarket_` + id,
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: divideByTenToTheNth(market.borrowCap, decimals),
        supplyCap: divideByTenToTheNth(market.supplyCap, decimals),
        rateModel: InterestRateModel,
        closeFactor: market.closeFactor / PERMILL_BASE,
        lendTokenId: lendTokenIdNo,
        reserveFactor: market.reserveFactor / PERMILL_BASE,
        collateralFactor: market.collateralFactor / PERMILL_BASE,
        liquidateIncentive: divideByTenToTheNth(market.liquidateIncentive, decimals),
        liquidationThreshold: market.liquidationThreshold / PERMILL_BASE,
        liquidateIncentiveReservedFactor: market.liquidateIncentiveReservedFactor / PERMILL_BASE,
        currencySymbol: await symbolFromCurrency(currency)
    });

    switch(market.state.__kind){
        case 'Active':
            my_market.state = MarketState.Active;
            break;
        case 'Pending':
            my_market.state = MarketState.Pending;
            break;
        case 'Supervision':
            my_market.state = MarketState.Supervision;
            break;
        default:
            throw new Error(`Unsupported market state: ${market.state}`);
    }
    entityBuffer.pushEntity(LoanMarket.name, my_market);
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
    entityBuffer.pushEntity(LoanMarketActivation.name, activation);
    entityBuffer.pushEntity(LoanMarket.name, marketDb);
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
    const account = address.parachain.encode(accountId);
    
    const amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
    const comment = `${getFirstAndLastFour(account)} borrowed ${await friendlyAmount(currency, amount.toString())}`
    
    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountBorrowed: amount,
            amountBorrowedUsdt: amounts.usdt.toNumber(),
            amountBorrowedBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: await symbolFromCurrency(currency)

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
    const account = address.parachain.encode(accountId);
    
    let amounts;
    let comment;
    let symbol;
    if(currency.isTypeOf==='LendToken'){
        const newCurrency = await lendTokenDetails(ctx, currency.lendTokenId);
        symbol = await symbolFromCurrency(newCurrency);
        const qRate = cachedRates.getRate(block.height, symbol);

        const newAmount = Big(amount.toString()).mul(qRate.rate);
        amounts = await getExchangeRate(ctx, block.timestamp, newCurrency, newAmount);
        symbol = `q`.concat(symbol);
        if(newCurrency){
            comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(newCurrency, newAmount)} for collateral`
        }
    } else {
        symbol = await symbolFromCurrency(currency);
        amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
        comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(currency, amount.toString())} for collateral`
    }
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            userParachainAddress: account,
            type: `collateral`,
            token: currency,
            symbol: symbol,
            amountDeposited: amount,
            amountDepositedUsdt: amounts.usdt.toNumber(),
            amountDepositedBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: symbol
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
    const account = address.parachain.encode(accountId);

    let amounts;
    let comment;
    let symbol;
    if(currency.isTypeOf==='LendToken'){
        const newCurrency = await lendTokenDetails(ctx, currency.lendTokenId)
        symbol = await symbolFromCurrency(newCurrency);
        const qRate = cachedRates.getRate(block.height, symbol);

        const newAmount = Big(amount.toString()).mul(qRate.rate);
        amounts = await getExchangeRate(ctx, block.timestamp, newCurrency, newAmount);
        symbol = `q`.concat(symbol);
        if(newCurrency){
            comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(newCurrency, newAmount)} from collateral`
        }
    } else {
        symbol = await symbolFromCurrency(currency);
        amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
        comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(currency, amount.toString())} from collateral`
    }
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            date: truncateTimestampToDate(block.timestamp),
            timestamp: new Date(block.timestamp),
            userParachainAddress: account,
            token: currency,
            symbol: symbol,
            type: `collateral`,
            amountWithdrawn: amount,
            amountWithdrawnUsdt: amounts.usdt.toNumber(),
            amountWithdrawnBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: symbol
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
    const symbol = await symbolFromCurrency(currency);
    const height = await blockToHeight(ctx, block.height, "Deposit");
    const account = address.parachain.encode(accountId);
    const amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
    const comment = `${getFirstAndLastFour(account)} deposited ${await friendlyAmount(currency, amount.toString())} for lending`;
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            userParachainAddress: account,
            token: currency,
            symbol: symbol,
            type: `lending`,
            amountDeposited: amount,
            amountDepositedUsdt: amounts.usdt.toNumber(),
            amountDepositedBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: symbol
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
    const account = address.parachain.encode(accountId);

    const amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
    const comment = `${getFirstAndLastFour(account)} paid back ${await friendlyAmount(currency, amount.toString())}`

    await entityBuffer.pushEntity(
        Loan.name,
        new Loan({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            userParachainAddress: account,
            token: currency,
            amountRepaid: amount,
            amountRepaidUsdt: amounts.usdt.toNumber(),
            amountRepaidBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: await symbolFromCurrency(currency)
        })
    );
}

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
    const symbol = await symbolFromCurrency(currency);
    const height = await blockToHeight(ctx, block.height, "Redeemed");
    const account = address.parachain.encode(accountId);
    const amounts = await getExchangeRate(ctx, block.timestamp, currency, amount.toString());
    const comment = `${getFirstAndLastFour(account)} withdrew ${await friendlyAmount(currency, amount.toString())} from deposit`;
    await entityBuffer.pushEntity(
        Deposit.name,
        new Deposit({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            userParachainAddress: account,
            token: currency,
            symbol: symbol,
            type: `lending`,
            amountWithdrawn: amount,
            amountWithdrawnUsdt: amounts.usdt.toNumber(),
            amountWithdrawnBtc: amounts.btc.toNumber(),
            comment: comment,
            currencySymbol: await symbolFromCurrency(currency)
        })
    );
}

export async function liquidateLoan(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansLiquidatedBorrowEvent(ctx, item.event);
    let amountRepaid: bigint;
    let amountRepaidToken: Currency;
    let seizedCollateral: bigint;
    let seizedCollateralToken: Currency;
    let e;
    if (rawEvent.isV1021000) {
        e = rawEvent.asV1021000;
        amountRepaid = e.repayAmount;
        amountRepaidToken = currencyId.encode(e.liquidationCurrencyId);
        seizedCollateral = e.collateralUnderlyingAmount;
        seizedCollateralToken = currencyId.encode(e.collateralCurrencyId);
    }
    else {
        ctx.log.warn(`UNKOWN EVENT VERSION: LoansLiquidatedBorrowEvent`);
        return;
    }
    
    const amountRepaidExchangeRate = await getExchangeRate(ctx, block.timestamp, amountRepaidToken, amountRepaid.toString());
    const seizedCollateralExchangeRate = await getExchangeRate(ctx, block.timestamp, seizedCollateralToken, seizedCollateral.toString());
    const liquidationCostBtc = seizedCollateralExchangeRate.btc.minus(amountRepaidExchangeRate.btc);
    const liquidationCostAmount = seizedCollateralExchangeRate.btcExchangeRate.toCounter(
        // liquidationCostBtc is in base value
        newMonetaryAmount(liquidationCostBtc, Bitcoin, true)
    );

    // liquidation cost in atomic units
    const liquidationCost = BigInt(
        liquidationCostAmount.toString(true)
    );
    // liquidation cost in human readable form (or in "base units")
    const liquidationCostHuman = BigDecimal(liquidationCostAmount.toString());

    // get lib currencies for the symbols
    const [repaidCurrencyExt, seizedCurrencyExt ] = await Promise.all([
        currencyToLibCurrencyExt(amountRepaidToken),
        currencyToLibCurrencyExt(seizedCollateralToken),
    ]);

    const repaidAmount = newMonetaryAmount(amountRepaid.toString(), repaidCurrencyExt);
    const seizedAmount = newMonetaryAmount(seizedCollateral.toString(), seizedCurrencyExt);

    entityBuffer.pushEntity(
        LoanLiquidation.name,
        new LoanLiquidation({
            id: item.event.id,
            amountRepaid: amountRepaid,
            amountRepaidHuman: BigDecimal(repaidAmount.toString()),
            amountRepaidToken: amountRepaidToken,
            amountRepaidSymbol: repaidCurrencyExt.ticker,
            seizedCollateral: seizedCollateral,
            seizedCollateralHuman: BigDecimal(seizedAmount.toString()),
            seizedCollateralToken: seizedCollateralToken,
            seizedCollateralSymbol: seizedCurrencyExt.ticker,
            liquidationCost,
            liquidationCostHuman,
            liquidationCostToken: seizedCollateralToken,
            liquidationCostSymbol: seizedCurrencyExt.ticker,
            timestamp: new Date(block.timestamp),
        })
    );
}

// Whenever a loan is taken or repaid, interest is accrued by slightly changing the exchange rate
export async function accrueInterest(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansInterestAccruedEvent(ctx, item.event);
    const interestAccrued = rawEvent.asV1021000;
    const { exchangeRate: exchangeRate} = interestAccrued;
    const ex = divideByTenToTheNth(exchangeRate, FIXEDI128_SCALING_FACTOR)

    const currency = currencyId.encode(interestAccrued.underlyingCurrencyId);
    const height = await blockToHeight(ctx, block.height, "Interest Accrued");
    const symbol = await symbolFromCurrency(currency);
    const decimals = await decimalsFromCurrency(currency);
    cachedRates.addRate(
        block.height,
        symbol,
        ex,
    );

    const totalBorrowsUsdtAndBtc = await getExchangeRate(ctx, block.timestamp, currency, interestAccrued.totalBorrows.toString());
    const totalReservesUsdtAndBtc = await getExchangeRate(ctx, block.timestamp, currency, interestAccrued.totalReserves.toString());
    const borrowIndexUsdtAndBtc = await getExchangeRate(ctx, block.timestamp, currency, interestAccrued.borrowIndex.toString());
    
    await entityBuffer.pushEntity(
        InterestAccrual.name,
        new InterestAccrual({
            id: item.event.id,
            height: height,
            timestamp: new Date(block.timestamp),
            date: truncateTimestampToDate(block.timestamp),
            underlyingCurrency: currency,
            currencySymbol: symbol,
            totalBorrows: interestAccrued.totalBorrows,
            totalReserves: interestAccrued.totalReserves,
            borrowIndex: interestAccrued.borrowIndex,
            totalBorrowsNative: divideByTenToTheNth(interestAccrued.totalBorrows, decimals),
            totalReservesNative: divideByTenToTheNth(interestAccrued.totalReserves, decimals),
            borrowIndexNative: divideByTenToTheNth(interestAccrued.borrowIndex, decimals),
            totalBorrowsUsdt: totalBorrowsUsdtAndBtc.usdt.toNumber(),
            totalReservesUsdt: totalReservesUsdtAndBtc.usdt.toNumber(),
            borrowIndexUsdt: borrowIndexUsdtAndBtc.usdt.toNumber(),
            utilizationRatio: interestAccrued.utilizationRatio / PERMILL_BASE,
            borrowRate: interestAccrued.borrowRate,
            supplyRate: interestAccrued.supplyRate,
            borrowRatePct: divideByTenToTheNth(interestAccrued.borrowRate, FIXEDI128_SCALING_FACTOR) * 100,
            supplyRatePct: divideByTenToTheNth(interestAccrued.supplyRate, FIXEDI128_SCALING_FACTOR) * 100,
            exchangeRate: interestAccrued.exchangeRate,
            exchangeRateFloat: ex,
            comment: `Exchange rate for ${symbol} now ${ex}`
        })
    );
}

