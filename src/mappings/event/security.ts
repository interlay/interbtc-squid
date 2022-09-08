import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { Height } from "../../model";
import { SecurityUpdateActiveBlockEvent } from "../../types/events";
import { eventArgs } from "../_utils";

export async function updateActiveBlock(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new SecurityUpdateActiveBlockEvent(ctx);
    let e;
    if (!rawEvent.isV4)
        ctx.log.warn(`UNKOWN EVENT VERSION: Security.updateActiveBlock`);
    e = rawEvent.asV4;

    const newHeight = new Height({
        id: ctx.block.height.toString(),
        absolute: ctx.block.height,
        active: e.blockNumber,
    });

    await ctx.store.save(newHeight);
}
