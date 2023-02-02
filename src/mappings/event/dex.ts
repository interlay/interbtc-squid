import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx, EventItem } from "../../processor";
import EntityBuffer from "../utils/entityBuffer";

export async function dexGeneralAssetSwap(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    throw Error("Not implemented yet");
    return;
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