import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Height } from "../../model";
import { SecurityUpdateActiveBlockEvent } from "../../types/events";

export async function updateActiveBlock(ctx: EventHandlerContext): Promise<void> {
    const e = new SecurityUpdateActiveBlockEvent(ctx).asLatest;

    const newHeight = new Height({
        id: e.blockNumber.toString(),
        absolute: ctx.block.height,
        active: e.blockNumber,
    });

    await ctx.store.save(newHeight);
}
