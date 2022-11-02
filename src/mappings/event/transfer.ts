import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Transfer } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { TokensTransferEvent } from "../../types/events";
import { address, currencyId, legacyCurrencyId } from "../encoding";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";

export async function tokensTransfer(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensTransferEvent(ctx, item.event);
    // let e;
    let amount;
    let currency;
    let to;
    let from;
    let eventCcyId;
    if (rawEvent.isV6 || rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV6) {
            [eventCcyId, from, to, amount] = rawEvent.asV6;
        } else if (rawEvent.isV10) {
            ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV10);
        } else {
            ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV15);
        }
        currency = legacyCurrencyId.encode(eventCcyId);
    } else {
        if (!rawEvent.isV17) {
            ctx.log.warn(`UNKOWN EVENT VERSION: tokens.transfer`);
            return;
        }
        ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV17);
        currency = currencyId.encode(eventCcyId);
    }

    const height = await blockToHeight(ctx, block.height, "TokensTransfer");

    await entityBuffer.pushEntity(
        Transfer.name,
        new Transfer({
            id: item.event.id,
            height,
            timestamp: new Date(block.timestamp),
            from: address.interlay.encode(from),
            to: address.interlay.encode(to),
            token: currency,
            amount,
        })
    );
}
