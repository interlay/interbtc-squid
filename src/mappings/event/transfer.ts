import Debug from "debug";
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { blockToHeight } from "../_utils";
import { TokensTransferEvent } from "../../types/events";
import { Transfer } from "../../model";
import { address, currencyId, legacyCurrencyId } from "../encoding";

const debug = Debug("interbtc-mappings:transfer");

export async function tokensTransfer(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new TokensTransferEvent(ctx);
    let e;
    let currency;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        currency = legacyCurrencyId.encode(e.currencyId);
    } else {
        if (rawEvent.isV17) e = rawEvent.asV17;
        else e = rawEvent.asLatest;
        currency = currencyId.encode(e.currencyId);
    }
    if (rawEvent.isV10) e = rawEvent.asV10;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else e = rawEvent.asLatest;

    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "TokensTransfer"
    );

    const transfer = new Transfer({
        id:
            e.currencyId.toString() +
            toHex(e.from) +
            toHex(e.to) +
            ctx.event.indexInBlock.toString(),
        height,
        timestamp: new Date(ctx.block.timestamp),
        from: address.interlay.encode(e.from),
        to: address.interlay.encode(e.to),
        token: currency,
        amount: e.amount,
    });

    await ctx.store.save(transfer);
}
