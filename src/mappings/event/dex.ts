import { SubstrateBlock } from "@subsquid/substrate-processor";
import { CumulativeDexTradingVolumePerPool, Currency, fromJsonPooledToken, PooledToken, PoolType } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { DexGeneralAssetSwapEvent } from "../../types/events";
import { currencyId } from "../encoding";
import { GeneralSwapDetails, updateCumulativeDexVolumesForStandardPool } from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { inferGeneralPoolId } from "../utils/pools";

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

    let poolId: string;

    const poolType: PoolType = PoolType.Standard;
    let swapDetails: GeneralSwapDetails;

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
        poolId = inferGeneralPoolId(currencyIn, currencyOut);
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
    throw Error("Not implemented yet");
    return;
}