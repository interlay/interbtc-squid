import Debug from "debug";
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { blockToHeight } from "../_utils";
import { TokensTransferEvent } from "../../types/events";
import { Transfer } from "../../model";
import { address, currencyId } from "../encoding";

const debug = Debug("interbtc-mappings:transfer");

export async function tokensTransfer(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new TokensTransferEvent(ctx);
    let e;
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
        token: currencyId.token.encode(e.currencyId),
        amount: e.amount,
    });

    await ctx.store.save(transfer);
}
