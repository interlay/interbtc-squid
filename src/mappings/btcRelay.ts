import { EventContext, StoreContext } from "@subsquid/hydra-common";
import {RelayedBlock} from "../generated/model/relayedBlock.model";
import {BTCRelay} from "../types/BTCRelay";
import {blockToHeight} from "./_utils";

export async function storeMainChainHeader({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        backingHeight,
        blockHash,
        relayer
    ] = new BTCRelay.StoreMainChainHeaderEvent(event).params;
    const relayedAtHeight = await blockToHeight({ store }, block.height, "StoreMainChainHeader");
    const relayedBlock = new RelayedBlock({
        id: backingHeight.toString(),
        relayedAtHeight,
        timestamp: new Date(block.timestamp),
        blockHash: blockHash.toString(),
        backingHeight: backingHeight.toNumber(),
        relayer: relayer.toString(),
    });
    await store.save(relayedBlock);
}
