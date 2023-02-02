import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Currency } from "../../model";
import { Ctx } from "../../processor";
import { DexStablePoolsStorage } from "../../types/storage";
import { Pool, Pool_Base, Pool_Meta } from "../../types/v1021000";
import { currencyId as currencyEncoder } from "../encoding";

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
        // check pool is found and as a BasePool
        if (pool == undefined ) {
            throw Error(`getStablePoolCurrencyByIndex: Unable to find stable pool in storage for given poolId [${poolId}]`);
        } else if (!isBasePool(pool)) {
            throw Error(`getStablePoolCurrencyByIndex: Found pool for given poolId [${poolId}], but it is an unexpected pool type [${pool.__kind}]`);
        }

        const currencyIds = pool.value.currencyIds;
        const currencies = currencyIds.map((currencyId) => currencyEncoder.encode(currencyId));
        setPoolCurrencies(poolId, currencies);

        if (currencies.length > index) {
            return currencies[index];
        }
    } else {
        throw Error("getStablePoolCurrencyByIndex: Unknown DexStablePoolsStorage version");
    }

    throw Error(`getStablePoolCurrencyByIndex: Unable to find currency in DexStablePoolsStorage for given poolId [${poolId}] and currency index [${index}]`);
}
