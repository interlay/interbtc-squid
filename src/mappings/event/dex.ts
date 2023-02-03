import { SubstrateBlock } from "@subsquid/substrate-processor";
import { CumulativeDexTradingVolumePerPool, Currency, fromJsonPooledToken, PooledToken, PoolType } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { DexGeneralAssetSwapEvent, DexStableCurrencyExchangeEvent } from "../../types/events";
import { DexStablePoolsStorage } from "../../types/storage";
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

export async function dexGeneralAssetSwap(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new DexGeneralAssetSwapEvent(ctx, item.event);

    let swapDetails: SwapDetails;

    if (rawEvent.isV1021000) {
        const [, , swapPath, balances] = rawEvent.asV1021000;
        if (swapPath.length !== 2) {
            ctx.log.error(`Unexpected swap path length ${swapPath.length} (expected: 2), skip processing of DexGeneralAssetSwapEvent`);
            return;
        } else if (balances.length !== 2) {
            ctx.log.error(`Unexpected balances length ${balances.length} (expected: 2), skip processing of DexGeneralAssetSwapEvent`);
            return;
        }

        const currencyIn = currencyId.encode(swapPath[0]);
        const currencyOut = currencyId.encode(swapPath[1]);
        if (!isPooledToken(currencyIn)) {
            ctx.log.error(`Unexpected currencyIn type ${currencyIn.isTypeOf}, skip processing of DexGeneralAssetSwapEvent`);
            return;
        }
        if (!isPooledToken(currencyOut)) {
            ctx.log.error(`Unexpected currencyOut type ${currencyOut.isTypeOf}, skip processing of DexGeneralAssetSwapEvent`);
            return;
        }

        const amountIn = balances[0];
        const amountOut = balances[1];
        swapDetails = {
            from: {
                currency: currencyIn,
                atomicAmount: amountIn
            },
            to: {
                currency: currencyOut,
                atomicAmount: amountOut
            }
        };

    } else {
        ctx.log.warn("UNKOWN EVENT VERSION: DexGeneral.AssetSwap");
        return;
    }

    const entityPromise = updateCumulativeDexVolumesForStandardPool(
        ctx.store,
        new Date(block.timestamp),
        swapDetails,
        entityBuffer
    );

    entityBuffer.pushEntity(
        CumulativeDexTradingVolumePerPool.name,
        await entityPromise
    );
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