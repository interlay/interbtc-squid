import { cloneDeep } from "lodash";
import {
    CumulativeCirculatingSupply,
    CumulativeDexTradingVolume,
    CumulativeDexTradingVolumePerPool,
    CumulativeDexTradingVolumePerAccount,
    CumulativeDexTradeCount,
    CumulativeDexTradeCountPerAccount 
} from "../../model";

/**
 * Clones entities that have an id and tillTimestamp field, and after cloning replaces
 * id and tillTimestamp values with the passed in ones.
 * @param entity The entity to make a clone of
 * @param entityId The id to set clone.id to
 * @param tillTimestamp The timestamp to set clone.tillTimestamp to
 * @returns A clone of the provided entity ith updated id and timestamp.
 */
export function cloneTimestampedEntity<
    T extends CumulativeCirculatingSupply |
    CumulativeDexTradingVolume | 
    CumulativeDexTradingVolumePerPool | 
    CumulativeDexTradingVolumePerAccount |
    CumulativeDexTradeCount |
    CumulativeDexTradeCountPerAccount
>(
    entity: T,
    entityId: string,
    tillTimestamp: Date
): T {
    // deep clone to preserve existing amounts
    const clone = cloneDeep(entity);
    // change id and tillTimestamp
    clone.id = entityId;
    clone.tillTimestamp = tillTimestamp;
    return clone;
}
