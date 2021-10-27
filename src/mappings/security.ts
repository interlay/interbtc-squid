import {EventContext, StoreContext} from "@subsquid/hydra-common";
import { Security } from "../types";
import { Height } from "../generated/model";

export async function updateActiveBlock({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        blockNumber,
    ] = new Security.UpdateActiveBlockEvent(event).params;
    const lastUpdate = (await store.get(Height, {order: {active: "DESC"}})) || new Height({
        absolute: -1n,
        active: 0
    }); // get latest active block, or default to 0th block
    const newHeight = new Height({
        absolute: BigInt(block.height),
        active: blockNumber.toNumber(),
    });
    console.log(`New active block ${blockNumber.toNumber()}, at absolute block ${block.height}`);
    const backfill: Height[] = [];
    console.log(`Backfilling heights from absolute block ${lastUpdate.absolute + 1n} to < ${newHeight.absolute} with active block ${lastUpdate.active}`);
    for (let i = lastUpdate.absolute + 1n; i < newHeight.absolute; i += 1n) {
        backfill.push(new Height({
            absolute: i,
            active: lastUpdate.active
        }));
    }
    backfill.push(newHeight);
    console.log(`Saving ${backfill.length} total new heights`);
    await Promise.all(backfill.map(async height => {
        console.log(`Saving block ${height.absolute} with active height ${height.active}`);
        await store.save(height);
    }));
}
