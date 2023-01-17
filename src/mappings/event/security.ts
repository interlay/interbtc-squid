import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Height } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { SecurityUpdateActiveBlockEvent } from "../../types/events";
import EntityBuffer from "../utils/entityBuffer";
import { setCache } from "../utils/heights";

export async function updateActiveBlock(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entitybuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new SecurityUpdateActiveBlockEvent(ctx, item.event);
    let e;
    if (rawEvent.isV4) e = rawEvent.asV4;
    else {
        e = rawEvent.asV1019000;
        if (!rawEvent.isV1019000)
            ctx.log.warn(`UNKOWN EVENT VERSION: Security.updateActiveBlock`);
    }

    const newHeight = new Height({
        id: block.height.toString(),
        absolute: block.height,
        active: e.blockNumber,
    });

    setCache(block.height, newHeight);

    entitybuffer.pushEntity(Height.name, newHeight);
}
