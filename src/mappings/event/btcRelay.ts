import * as ss58 from "@subsquid/ss58";
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { RelayedBlock } from "../../model";
import { BtcRelayStoreMainChainHeaderEvent } from "../../types/events";
import { blockToHeight } from "../_utils";

export async function storeMainChainHeader(ctx: EventHandlerContext): Promise<void> {
    // const [backingHeight, blockHash, relayer] =
    //     new BTCRelay.StoreMainChainHeaderEvent(event).params;
    const e = new BtcRelayStoreMainChainHeaderEvent(ctx).asLatest

    const relayedAtHeight = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "StoreMainChainHeader"
    );

    const relayedBlock = new RelayedBlock({
        id: e.blockHeight.toString(),
        relayedAtHeight,
        timestamp: new Date(ctx.block.timestamp),
        blockHash: toHex(e.blockHash.content),
        backingHeight: e.blockHeight,
        relayer: ss58.codec(42).encode(e.relayerId),
    });

    await ctx.store.save(relayedBlock);
}
