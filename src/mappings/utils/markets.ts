import {LessThanOrEqual} from "typeorm";
import { Currency, LoanMarket } from "../../model";
import {Ctx} from "../../processor";

const inMemoryCache = new Map<number, Currency>();

export function setCache(block: number, currency: Currency) {
    inMemoryCache.set(block, currency);
}

export async function lendTokenDetails(
    ctx: Ctx,
    id: number,
): Promise<Currency | void>  {
    // first check in-memory
    const cacheLookup = inMemoryCache.get(id);
    if (cacheLookup !== undefined) return cacheLookup;

    // if not found, fetch from DB
    const existingEntity = await ctx.store.get(LoanMarket, {
        where: { lendTokenId: id },
    });
    if (existingEntity !== undefined) {
        // was already set for current block, either by UpdateActiveBlock or previous invocation of blockToHeight
        inMemoryCache.set(id, existingEntity.token)
        return existingEntity.token;
    } else {
            ctx.log.warn(
                `WARNING: Did not find LoanMarket entity for id ${id}. `
            );
           }
}

export function clearCache() {
    inMemoryCache.clear();
}
