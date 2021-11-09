import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Security } from "../../types";
import { Height } from "../../generated/model";

export async function updateActiveBlock({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [blockNumber] = new Security.UpdateActiveBlockEvent(event).params;
    const newHeight = new Height({
        id: block.height.toString(),
        absolute: block.height,
        active: blockNumber.toNumber(),
    });
    await store.save(newHeight);
}
