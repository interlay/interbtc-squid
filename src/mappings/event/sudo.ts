import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx, EventItem } from "../../processor";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { updateRedeemPeriodFromStorage } from "../utils/requestPeriods";

// This function only really exists to check if redeem period has been set using sudo
/**
 * This function only really exists to check if redeem period has
 * been set using sudo and update the value if it has changed.
 * (As has been the case on interlay for block #514261.)
 */
export async function sudid(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const height = await blockToHeight(ctx, block.height);
    return updateRedeemPeriodFromStorage(ctx, block, height);
}
