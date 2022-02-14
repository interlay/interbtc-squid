import { reverseEndiannessHex } from "@interlay/interbtc-api";
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { RelayedBlock } from "../../model";
import { BtcRelayStoreMainChainHeaderEvent } from "../../types/events";
import { address } from "../encoding";
import { blockToHeight } from "../_utils";

export async function storeMainChainHeader(
    ctx: EventHandlerContext
): Promise<void> {
    // const [backingHeight, blockHash, relayer] =
    //     new BTCRelay.StoreMainChainHeaderEvent(event).params;
    const e = new BtcRelayStoreMainChainHeaderEvent(ctx).asLatest;

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
