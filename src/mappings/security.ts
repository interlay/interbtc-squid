import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Security } from "../types";
import { Height } from "../generated/model";

export async function updateActiveBlock({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [blockNumber] = new Security.UpdateActiveBlockEvent(event).params;
    const lastUpdate =
        (await store.get(Height, { order: { active: "DESC" } })) ||
        new Height({
            absolute: -1,
            active: 0,
        }); // get latest active block, or default to 0th block
    const newHeight = new Height({
        id: block.height.toString(),
        absolute: block.height,
        active: blockNumber.toNumber(),
    });
    const backfill: Height[] = [];
    for (let i = lastUpdate.absolute + 1; i < newHeight.absolute; i += 1) {
        backfill.push(
            new Height({
                id: i.toString(),
                absolute: i,
                active: lastUpdate.active,
            })
        );
    }
    backfill.push(newHeight);
    await Promise.all(
        backfill.map(async (height) => {
            await store.save(height);
        })
    );
}
