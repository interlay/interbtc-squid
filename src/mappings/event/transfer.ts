import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Transfer } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { TokensTransferEvent } from "../../types/events";
import { address, currencyId, legacyCurrencyId } from "../encoding";
import { blockToHeight } from "../utils/heights";

export async function tokensTransfer(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Transfer> {
    const rawEvent = new TokensTransferEvent(ctx, item.event);
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

    const height = await blockToHeight(ctx, block.height, "TokensTransfer");

    const ret = new Transfer({
        id: item.event.id,
        height,
        timestamp: new Date(block.timestamp),
        from: address.interlay.encode(e.from),
        to: address.interlay.encode(e.to),
        token: currency,
        amount: e.amount,
    });
    return ret;
}
