import { reverseEndiannessHex } from "@interlay/interbtc-api";
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { RelayedBlock } from "../../model";
import { BtcRelayStoreMainChainHeaderEvent } from "../../types/events";
import { address } from "../encoding";
import { blockToHeight, eventArgs } from "../_utils";

export async function storeMainChainHeader(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new BtcRelayStoreMainChainHeaderEvent(ctx);
    let e;
    if (!rawEvent.isV4)
        ctx.log.warn(`UNKOWN EVENT VERSION: BTCRelay.storeMainChainHeader`);
    e = rawEvent.asV4;

    const relayedAtHeight = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "StoreMainChainHeader"
    );

    const relayedBlock = new RelayedBlock({
        id: e.blockHeight.toString(),
        relayedAtHeight,
        timestamp: new Date(ctx.block.timestamp),
        blockHash: reverseEndiannessHex(toHex(e.blockHash.content)),
        backingHeight: e.blockHeight,
        relayer: address.interlay.encode(e.relayerId),
    });

    await ctx.store.save(relayedBlock);
}
