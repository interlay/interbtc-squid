import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Height } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { SecurityUpdateActiveBlockEvent } from "../../types/events";
import { setCache } from "../utils/heights";

export async function updateActiveBlock(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Height> {
    const rawEvent = new SecurityUpdateActiveBlockEvent(ctx, item.event);
    let e;
    if (!rawEvent.isV4)
        ctx.log.warn(`UNKOWN EVENT VERSION: Security.updateActiveBlock`);
    e = rawEvent.asV4;

    const newHeight = new Height({
        id: block.height.toString(),
        absolute: block.height,
        active: e.blockNumber,
    });

    setCache(block.height, newHeight);

    return newHeight;
}
