import BN from "bn.js";
import { StoreContext } from "@subsquid/hydra-common";
import { Height } from "../generated/model";

export async function blockToHeight(
    { store }: StoreContext,
    absoluteBlock: number,
    eventName = ""
): Promise<Height> {
    const height = await store.get(Height, {
        where: { absolute: new BN(absoluteBlock) },
    });
    if (height === undefined)
        throw new Error(
            `Did not find Height entity for absolute block ${absoluteBlock} while processing ${eventName} event; this should never happen, unless the parachain has not produced a single active block yet!`
        );
    return height;
}
