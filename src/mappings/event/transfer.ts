import { EventHandlerContext } from "@subsquid/substrate-processor";
import { blockToHeight, eventArgs } from "../_utils";
import { TokensTransferEvent } from "../../types/events";
import { Transfer } from "../../model";
import { address, currencyId, legacyCurrencyId } from "../encoding";
import { Store } from "@subsquid/typeorm-store";

export async function tokensTransfer(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new TokensTransferEvent(ctx);
    ctx.event;
    let e;
    let currency;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        currency = legacyCurrencyId.encode(e.currencyId);
    } else {
        if (!rawEvent.isV17) {
            ctx.log.warn(`UNKOWN EVENT VERSION: tokens.transfer`);
        }
        e = rawEvent.asV17;
        currency = currencyId.encode(e.currencyId);
    }
    if (rawEvent.isV10) e = rawEvent.asV10;

    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "TokensTransfer"
    );

    const transfer = new Transfer({
        id: ctx.event.id,
        height,
        timestamp: new Date(ctx.block.timestamp),
        from: address.interlay.encode(e.from),
        to: address.interlay.encode(e.to),
        token: currency,
        amount: e.amount,
    });

    await ctx.store.save(transfer);
}
