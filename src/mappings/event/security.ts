import Debug from "debug";
import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Height } from "../../model";
import { SecurityUpdateActiveBlockEvent } from "../../types/events";

export async function updateActiveBlock(
    ctx: EventHandlerContext
): Promise<void> {
    const rawEvent = new SecurityUpdateActiveBlockEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else throw Error("Unknown event version");

    const newHeight = new Height({
        id: ctx.block.height.toString(),
        absolute: ctx.block.height,
        active: e.blockNumber,
    });

    await ctx.store.save(newHeight);
}
