import { SubstrateBlock } from "@subsquid/substrate-processor";
import { CumulativeDexTradingVolumePerPool, Currency, fromJsonPooledToken, PooledToken } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { DexGeneralAssetSwapEvent, DexStableCurrencyExchangeEvent } from "../../types/events";
import { currencyId } from "../encoding";
import { SwapDetails, updateCumulativeDexVolumesForStablePool, updateCumulativeDexVolumesForStandardPool } from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { getStablePoolCurrencyByIndex } from "../utils/pools";

function isPooledToken(currency: Currency): currency is PooledToken {
    try {
        fromJsonPooledToken(currency);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Combines the given arrays into in/out pairs as an array of {@link SwapDetails}.
 * @param currencies The currencies in the swap path
 * @param atomicBalances The swapped balances, in atomic units and same order as currencies
 * @returns An array of pair-wise combined {@link SwapDetails}.
 * @throws {@link Error}
 * Throws an error if currencies length does not match balances length, or if a passed in currency is not a {@link PooledToken}
 */
function createPairWiseSwapDetails(currencies: Currency[], atomicBalances: bigint[]): SwapDetails[] {
    if (currencies.length !== atomicBalances.length) {
        throw new Error(`Cannot combine pair wise swap details; currency count [${
            currencies.length
        }] does not match balance count [${
            atomicBalances.length
        }]`);
    }

    const swapDetailsList: SwapDetails[] = [];
    for(let idx = 0; (idx + 1) < currencies.length; idx++) {
        const inIdx = idx;
        const outIdx = idx + 1;
        const currencyIn = currencies[inIdx];
        const currencyOut = currencies[outIdx];
        
        if (!isPooledToken(currencyIn)) {
            throw new Error(`Cannot combine pair wise swap details; unexpected currency type ${
                currencyIn.isTypeOf
            } in pool, skip processing of DexGeneralAssetSwapEvent`);
        } else if (!isPooledToken(currencyOut)) {
            throw new Error(`Unexpected currency type ${
                currencyOut.isTypeOf
            } in pool, skip processing of DexGeneralAssetSwapEvent`);
        }

        swapDetailsList.push({
            from: {
                currency: currencyIn,
                atomicAmount: atomicBalances[inIdx]
            },
            to: {
                currency: currencyOut,
                atomicAmount: atomicBalances[outIdx]
            }
        });
    }

    return swapDetailsList;
}

export async function dexGeneralAssetSwap(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new DexGeneralAssetSwapEvent(ctx, item.event);
    let currencies: Currency[] = [];
    let atomicBalances: bigint[] = [];

    if (rawEvent.isV1021000) {
        const [, , swapPath, balances] = rawEvent.asV1021000;
        currencies = swapPath.map(currencyId.encode);
        atomicBalances = balances;
    } else {
        ctx.log.warn("UNKOWN EVENT VERSION: DexGeneral.AssetSwap");
        return;
    }

    // we can only use pooled tokens, check we have not other ones
    for (const currency of currencies) {
        if (!isPooledToken(currency)) {
            ctx.log.error(`Unexpected currency type ${currency.isTypeOf} in pool, skip processing of DexGeneralAssetSwapEvent`);
            return;
        }
    }

    let swapDetailsList: SwapDetails[];
    try {
        swapDetailsList = createPairWiseSwapDetails(currencies, atomicBalances);
    } catch (e) {
        ctx.log.error((e as Error).message);
        return;
    }

    // construct and await sequentially, otherwise some operations may try to read values from 
    // the entity buffer before it has been updated
    for (const swapDetails of swapDetailsList) {
        const entity = await updateCumulativeDexVolumesForStandardPool(
            ctx.store,
            new Date(block.timestamp),
            swapDetails,
            entityBuffer
        );
    
        entityBuffer.pushEntity(CumulativeDexTradingVolumePerPool.name, entity);
    }
}

export async function dexStableCurrencyExchange(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new DexStableCurrencyExchangeEvent(ctx, item.event);
    let poolId: number;
    let inIndex: number;
    let outIndex: number;
    let inAmount: bigint;
    let outAmount: bigint;

    if (rawEvent.isV1021000) {
        const event = rawEvent.asV1021000;
        poolId = event.poolId;
        inIndex = event.inIndex;
        outIndex = event.outIndex;
        inAmount = event.inAmount;
        outAmount = event.outAmount;
    } else {
        ctx.log.warn("UNKOWN EVENT VERSION: DexStable.CurrencyExchange");
        return;
    }

    const outCurrency = await getStablePoolCurrencyByIndex(ctx, block, poolId, outIndex);
    const inCurrency = await getStablePoolCurrencyByIndex(ctx, block, poolId, inIndex);
    
    if (!isPooledToken(inCurrency)) {
        ctx.log.error(`Unexpected currencyIn type ${inCurrency.isTypeOf}, skip processing of DexGeneralAssetSwapEvent`);
        return;
    }
    if (!isPooledToken(outCurrency)) {
        ctx.log.error(`Unexpected currencyOut type ${outCurrency.isTypeOf}, skip processing of DexGeneralAssetSwapEvent`);
        return;
    }

    const swapDetails: SwapDetails = {
        from: {
            currency: inCurrency,
            atomicAmount: inAmount
        },
        to: {
            currency: outCurrency,
            atomicAmount: outAmount
        }
    };

    const entityPromise = updateCumulativeDexVolumesForStablePool(
        ctx.store,
        new Date(block.timestamp),
        poolId,
        swapDetails,
        entityBuffer
    );

    entityBuffer.pushEntity(
        CumulativeDexTradingVolumePerPool.name,
        await entityPromise
    );
}