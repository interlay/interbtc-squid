import { CurrencyExt, CurrencyIdentifier, currencyIdToMonetaryCurrency, FIXEDI128_SCALING_FACTOR, newCollateralBTCExchangeRate, newMonetaryAmount, StandardPooledTokenIdentifier } from "@interlay/interbtc-api";
import { Bitcoin, ExchangeRate } from "@interlay/monetary-js";
import { BigDecimal } from "@subsquid/big-decimal";
import { Store } from "@subsquid/typeorm-store";
import { Big, BigSource } from "big.js";
import * as process from "process";
import { LessThanOrEqual, Like } from "typeorm";
import { Currency, ForeignAsset, Height, Issue, OracleUpdate, OracleUpdateType, Redeem, Token, Vault } from "../model";
import { Ctx } from "../processor";
import { getInterBtcApi } from "./utils/interBtcApi";
import { VaultId as VaultIdV1021000 } from "../types/v1021000";
import { VaultId as VaultIdV15 } from "../types/v15";
import { VaultId as VaultIdV6 } from "../types/v6";
import { encodeLegacyVaultId, encodeVaultId } from "./encoding";
import { ForeignAsset as LibForeignAsset } from "@interlay/interbtc-api";

export type eventArgs = {
    event: { args: true };
};
export type eventArgsData = {
    data: eventArgs;
};

const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?

export async function getVaultIdLegacy(
    store: Store,
    vaultId: VaultIdV15 | VaultIdV6
) {
    return store.get(Vault, {
        where: { id: encodeLegacyVaultId(vaultId) },
    });
}

export async function getVaultId(store: Store, vaultId: VaultIdV1021000) {
    return store.get(Vault, {
        where: { id: encodeVaultId(vaultId) },
    });
}

export async function isRequestExpired(
    store: Store,
    request: Issue | Redeem,
    latestBtcBlock: number,
    latestActiveBlock: number,
    period: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: request.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet

    const btcPeriod = Math.ceil(period / parachainBlocksPerBitcoinBlock);

    return (
        request.request.backingHeight + btcPeriod < latestBtcBlock &&
        requestHeight.active + period < latestActiveBlock
    );
}

export function getFirstAndLastFour(str: string) {
    // If the string is less than 8 characters, return it as-is
    if (str.length < 8) {
        return str;
    }

    // Otherwise, return the first four characters plus "..." plus the last four characters
    return str.substring(0, 4) + "..." + str.substring(str.length - 4);
}

type AssetMetadata = {
    decimals: number;
    name: string;
    symbol: string;
}

// simple cache for foreign assets by id
const cache: Map<number, LibForeignAsset> = new Map();
let usdtAssetId: number;

export async function cacheForeignAssets(): Promise<void> {
    const interBtcApi = await getInterBtcApi();
    const foreignAssets = await interBtcApi.assetRegistry.getForeignAssets();
    foreignAssets.forEach((asset) => {
        const id = asset.foreignAsset.id;

        cache.set(id, asset);

        if(asset.ticker === 'USDT') {
            usdtAssetId = id;
        } 
    });
}

export async function getForeignAsset(id: number): Promise<LibForeignAsset> {
    if (cache.has(id)) {
        return cache.get(id)!;
    }

    const interBtcApi = await getInterBtcApi();
    const asset = await interBtcApi.assetRegistry.getForeignAsset(id);

    cache.set(id,asset);
    
    return asset;
}

/**
 * Helper methods to facilitate testing, use at own risk
 */
export const testHelpers = {
    getForeignAssetsCache: () => cache,
    getUsdtAssetId: () => usdtAssetId
};

/* This function takes a currency object (could be native, could be foreign) and
an amount (in the smallest unit, e.g. Planck) and returns a human friendly string
with a reasonable accuracy (6 digits after the decimal point for BTC and 2 for
all others)
*/
export async function friendlyAmount(currency: Currency, amount: BigSource): Promise<string> {
    const currencyExt = await currencyToLibCurrencyExt(currency);
    const monetaryAmount = newMonetaryAmount(amount.toString(), currencyExt);
    const amountFriendly = monetaryAmount.toBig();

    switch(currency.isTypeOf) {
        case 'NativeToken':
            switch (currency.token) {
                case 'KINT':
                case 'KSM':
                case 'INTR':
                case 'DOT':
                    return `${amountFriendly.toFixed(2)} ${currency.token}`;
                case 'KBTC':
                case 'IBTC':
                    return `${amountFriendly.toFixed(6)} ${currency.token}`;
                default:
                    return `Unknown token: ${currency}`
            }
        case 'ForeignAsset':
            return `${amountFriendly.toFixed(2)} ${currencyExt.ticker}`;
        default:
            return `Unknown asset: ${currency}`
    }
}

export function divideByTenToTheNth(amount: bigint, n: number): number {
    const divisor = Big(10**n);
    const amountBig = Big(amount.toString())
    const division = amountBig.div(divisor);
    const result = division.toNumber();
    return result;
}

export async function symbolFromCurrency(currency: Currency): Promise<string> {
    switch(currency.isTypeOf) {
        case 'NativeToken':
            return currency.token;
        case 'ForeignAsset':
            const details = await getForeignAsset(currency.asset)
            return details.ticker;
        default:
            return `UNKNOWN`;
    }
}

export async function decimalsFromCurrency(currency: Currency): Promise<number> {
    switch(currency.isTypeOf) {
        case 'NativeToken':
            switch (currency.token) {
                case 'KINT':
                case 'KSM':
                    return 12
                case 'INTR':
                case 'DOT':
                    return 10
                case 'KBTC':
                case 'IBTC':
                    return 8
                default:
                    return 0
            }
        case 'ForeignAsset':
            const details = await getForeignAsset(currency.asset)
            return details.decimals;
        default:
            return 0;
    }
}

function decodeRawExchangeRate(rate: BigSource): Big {
    return Big(rate).div(Big(10).pow(FIXEDI128_SCALING_FACTOR));
}

async function getBestOracleUpdate(
    ctx: Ctx,
    currency: Currency,
    timestamp: number
): Promise<OracleUpdate | undefined> {
    // the id ends the json string for the currency
    const currencySearchTerm = currency.toJSON();
    
    // first try the latest value available
    let oracleUpdate = await ctx.store.get(OracleUpdate, {
        where: { 
            id: Like(`%${JSON.stringify(currencySearchTerm)}`),
            timestamp: LessThanOrEqual(new Date(timestamp)),
            type: OracleUpdateType.ExchangeRate,
        },
        order: { timestamp: "DESC" },
    });

    if (oracleUpdate === undefined) {
        ctx.log.warn(
            `WARNING: no price registered by Oracle for ${JSON.stringify(currencySearchTerm)} at or before timestamp ${new Date(timestamp)}. Fetching first available value.`
        );
        // no luck, so let's take the closest available price even if it is in the future
        oracleUpdate = await ctx.store.get(OracleUpdate, {
            where: { 
                id: Like(`%${JSON.stringify(currencySearchTerm)}`),
                type: OracleUpdateType.ExchangeRate,
            },
            order: { timestamp: "ASC" },
        });
    }

    return oracleUpdate;
}

type OracleRate = {
    btcExchangeRate: ExchangeRate<Bitcoin, CurrencyExt>;
    btc: Big;
    usdt: Big;
}

/* This function is used to calculate the exchange rate for a given currency at
a given time.
*/
export async function getExchangeRate(
    ctx: Ctx,
    timestamp: number,
    currency: Currency,
    amount: BigSource,
): Promise<OracleRate>  {
    if(!usdtAssetId) {
        throw new Error("Unable to determine USDT Asset ID");
    }

    const usdtCurrency = new ForeignAsset({ asset: usdtAssetId });
    
    const [currencyExt, usdtCurrencyExt] = await Promise.all([
        currencyToLibCurrencyExt(currency),
        currencyToLibCurrencyExt(usdtCurrency)
    ]);

    let btcCcyExchangeRate: ExchangeRate<Bitcoin, CurrencyExt>;
    let btcUsdtExchangeRate: ExchangeRate<Bitcoin, CurrencyExt> | undefined;
    
    if (currency.isTypeOf === "NativeToken" 
        && (currency.token === Token.IBTC || currency.token === Token.KBTC)
    ) {
        // exchange rate between ibtc/kbtc and btc is assumed 1:1
        btcCcyExchangeRate = new ExchangeRate(Bitcoin, Bitcoin, Big(1));
    } else {
        // fetch oracle update value for btc vs currency
        const btcCurrencyPrice = await getBestOracleUpdate(ctx, currency, timestamp);

        if (btcCurrencyPrice === undefined) {
            throw Error(`Unable to get BTC exchange rate for currency ${JSON.stringify(currency.toJSON())}`);
        }

        btcCcyExchangeRate = newCollateralBTCExchangeRate(
            decodeRawExchangeRate(btcCurrencyPrice.updateValue.toString()),
            currencyExt
        );
    }

    // get oracle value for btc vs usdt
    const btcUsdtPrice = await getBestOracleUpdate(ctx, usdtCurrency, timestamp);
    const rawBtcUsdtRate = btcUsdtPrice?.updateValue.toString();

    btcUsdtExchangeRate = rawBtcUsdtRate 
        ? newCollateralBTCExchangeRate(
            decodeRawExchangeRate(rawBtcUsdtRate),
            usdtCurrencyExt
          )
        : undefined;

    const amountInCurrency = newMonetaryAmount(amount, currencyExt);
    const amountInBtc = btcCcyExchangeRate.toBase(amountInCurrency);
    const amountInUsdt = btcUsdtExchangeRate?.toCounter(amountInBtc);

    if (!btcUsdtExchangeRate) {
        ctx.log.warn(`getExchangeRate: No exchange rate found for USDT (foreignAsset: ${usdtAssetId}), defaulting to a zero amount`);
    }

    return {
        btcExchangeRate: btcCcyExchangeRate,
        btc: amountInBtc.toBig(),
        usdt: amountInUsdt?.toBig() || Big(0)
    }
}

const currencyMap = new Map<CurrencyIdentifier, CurrencyExt>();

export async function currencyToLibCurrencyExt(currency: Currency): Promise<CurrencyExt> {
    const interBtcApi = await getInterBtcApi();

    let id: CurrencyIdentifier;
    if (currency.isTypeOf === "NativeToken") {
        id = {token: currency.token};
    } else if (currency.isTypeOf === "ForeignAsset") {
        id = {foreignAsset: currency.asset };
    } else if (currency.isTypeOf === "LendToken") {
        id = {lendToken: currency.lendTokenId};
    } else if (currency.isTypeOf === "StableLpToken") {
        id = {stableLpToken: currency.poolId};
    } else if (currency.isTypeOf === "LpToken") {
        const token0 = (await currencyToLibCurrencyExt(currency.token0)) as unknown as StandardPooledTokenIdentifier;
        const token1 = (await currencyToLibCurrencyExt(currency.token1)) as unknown as StandardPooledTokenIdentifier;
        id =  {lpToken: [token0, token1]};
    } else {
        // using any for future proofing, TS thinks this is never which is correct until it isn't anymore
        // and we've extended the types
        throw new Error(`No handling implemented for given currency type [${(currency as any).isTypeOf}]`);
    }
    let currencyInfo: CurrencyExt;
    if ( currencyMap.has(id) ) {
        currencyInfo = currencyMap.get(id) as CurrencyExt;
    } else {
        const currencyId = interBtcApi.api.createType("InterbtcPrimitivesCurrencyId", id );
        currencyInfo  = await currencyIdToMonetaryCurrency(interBtcApi.api, currencyId);

        currencyMap.set(id , currencyInfo);
    }
    return currencyMap.get(id) as CurrencyExt;
}

/* This function takes a currency object (could be native, could be foreign) and
an atomic amount (in the smallest unit, e.g. Planck) and returns a BigDecimal representing 
the amount without rounding.
*/
export async function convertAmountToHuman(currency: Currency, amount: bigint ) : Promise<BigDecimal> {
    const currencyInfo: CurrencyExt = await currencyToLibCurrencyExt(currency);
    const monetaryAmount = newMonetaryAmount(amount.toString(), currencyInfo);
    return BigDecimal(monetaryAmount.toString());
}

// helper method to switch around key/value pairs for a given map
export function invertMap<K extends Object, V extends Object>(map: Map<K, V>): Map<V, K> {
    return new Map(Array.from(map, ([key, value]) => [value, key]));
}

// truncate a date
export function truncateTimestampToDate(timestamp: number): Date {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function isMainnet(): boolean {
    return process.env.BITCOIN_NETWORK?.toLowerCase() === "mainnet";
}