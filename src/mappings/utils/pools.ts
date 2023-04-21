import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Currency, Token } from "../../model";
import { Ctx } from "../../processor";
import { DexStablePoolsStorage } from "../../types/storage";
import { Pool, Pool_Base, Pool_Meta } from "../../types/v1021000";
import { invertMap } from "../_utils";
import { currencyId as currencyEncoder, currencyToString } from "../encoding";

const indexToCurrencyTypeMap: Map<number, string> = new Map([
    [0, "NativeToken"],
    [1, "ForeignAsset"],
    [2, "LendToken"],
    [3, "LpToken"],
    [4, "StableLpToken"]
]);
const currencyTypeToIndexMap = invertMap(indexToCurrencyTypeMap);

// Replicated order from parachain code. 
// See also https://github.com/interlay/interbtc/blob/d48fee47e153291edb92525221545c2f4fa58501/primitives/src/lib.rs#L469-L476
const indexToNativeTokenMap: Map<number, Token> = new Map([
    [0, Token.DOT],
    [1, Token.IBTC],
    [2, Token.INTR],
    [10, Token.KSM],
    [11, Token.KBTC],
    [12, Token.KINT]
]);

const nativeTokenToIndexMap = invertMap(indexToNativeTokenMap);

// poor man's stable pool id to currencies cache
const stablePoolCurrenciesCache = new Map<number, Currency[]>();

function setPoolCurrencies(poolId: number, currencies: Currency[]) {
    stablePoolCurrenciesCache.set(poolId, currencies);
}

export function clearPoolCurrencies() {
    stablePoolCurrenciesCache.clear();
}

export function isBasePool(pool: Pool): pool is Pool_Base {
    return pool.__kind === "Base";
}

export function isMetaPool(pool: Pool): pool is Pool_Meta {
    return pool.__kind === "Meta";
}

export async function getStablePoolCurrencyByIndex(ctx: Ctx, block: SubstrateBlock, poolId: number, index: number): Promise<Currency> {
    if (stablePoolCurrenciesCache.has(poolId)) {
        const currencies = stablePoolCurrenciesCache.get(poolId)!;
        if (currencies.length > index) {
            return currencies[index];
        }
    }

    // (attempt to) fetch from storage
    const rawPoolStorage = new DexStablePoolsStorage(ctx, block);
    if (!rawPoolStorage.isExists) {
        throw Error("getStablePoolCurrencyByIndex: DexStable.Pools storage is not defined for this spec version");
    } else if (rawPoolStorage.isV1021000) {
        const pool = await rawPoolStorage.getAsV1021000(poolId);
        let currencies: Currency[] = [];
        // check pool is found and as a BasePool
        if (pool == undefined ) {
            throw Error(`getStablePoolCurrencyByIndex: Unable to find stable pool in storage for given poolId [${poolId}]`);
        } else if (isBasePool(pool)) {
            const basePoolCurrencyIds = pool.value.currencyIds;
            currencies = basePoolCurrencyIds.map(currencyId => currencyEncoder.encode(currencyId));
        } else if (isMetaPool(pool)) {
            const metaPoolCurrencyIds = pool.value.info.currencyIds;
            currencies = metaPoolCurrencyIds.map(currencyId => currencyEncoder.encode(currencyId));
        } else {
            // use of any to future-proof for if/when pool types are expanded.
            throw Error(`getStablePoolCurrencyByIndex: Found pool for given poolId [${poolId}], but it is an unexpected pool type [${(pool as any).__kind}]`);
        }

        setPoolCurrencies(poolId, currencies);

        if (currencies.length > index) {
            return currencies[index];
        }
    } else {
        throw Error("getStablePoolCurrencyByIndex: Unknown DexStablePoolsStorage version");
    }

    throw Error(`getStablePoolCurrencyByIndex: Unable to find currency in DexStablePoolsStorage for given poolId [${poolId}] and currency index [${index}]`);
}

function compareCurrencyType(currency0: Currency, currency1: Currency): number {
    if (currency0.isTypeOf === currency1.isTypeOf) {
        return 0;
    }

    const typeIndex0 = currencyTypeToIndexMap.get(currency0.isTypeOf);
    const typeIndex1 = currencyTypeToIndexMap.get(currency1.isTypeOf);

    if (typeIndex0 === undefined) {
        throw Error(`Unable to find index for given currency type [${currency0.isTypeOf}]`);
    }
    if (typeIndex1 === undefined) {
        throw Error(`Unable to find index for given currency type [${currency1.isTypeOf}]`);
    }

    return typeIndex0 - typeIndex1;
}

function currencyToIndex(currency: Currency): number {
    switch(currency.isTypeOf) {
        case "NativeToken":
            const tokenIndex = nativeTokenToIndexMap.get(currency.token);
            if (tokenIndex === undefined) {
                throw Error(`currencyToIndex: Unknown or unhandled native token [${currency.token.toString()}]`);
            }
            return tokenIndex;
        case "ForeignAsset":
            return currency.asset;
        case "LendToken":
            return currency.lendTokenId;
        case "StableLpToken":
            return currency.poolId;
        default:
            throw Error(`currencyToIndex:  Unknown or unsupported currency type [${currency.isTypeOf}]`);
    }
}

/**
 * For sorting currencies.
 * @param currency0 first currency
 * @param currency1 second currency
 * @returns A negative number if currency0 should be listed before currency1, 
 *          a positive number if currency1 should be listed before currency0, 
 *          otherwise returns 0
 */
function compareCurrencies(currency0: Currency, currency1: Currency): number {
    const typeCompare = compareCurrencyType(currency0, currency1);
    if (typeCompare != 0) {
        return typeCompare;
    }

    const index0 = currencyToIndex(currency0);
    const index1 = currencyToIndex(currency1);
    return index0 - index1;
}

/**
 * Calculate the standard pool's id given 2 currencies.
 * This method will sort the currencies and return their ids/tickers in a specific order.
 * 
 * @param currency0 One currency
 * @param currency1 The other currency
 */
export function inferGeneralPoolId(currency0: Currency, currency1: Currency): string {
    let firstCurrencyString: string = currencyToString(currency0);
    let secondCurrencyString: string = currencyToString(currency1);
    
    const order: number = compareCurrencies(currency0, currency1);
    // swap strings around if needed
    if (order > 0) {
        // works because strings (ie. not the capitalized String) are passed by value
        const hold = firstCurrencyString;
        firstCurrencyString = secondCurrencyString;
        secondCurrencyString = hold;
    }

    return `(${firstCurrencyString},${secondCurrencyString})`;
}