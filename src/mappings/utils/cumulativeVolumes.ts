import {
    CumulativeDexTradingVolumePerPool,
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Currency,
    PooledAmount,
    PooledToken,
    PoolType,
    VolumeType,
} from "../../model";
import { Equal, LessThanOrEqual } from "typeorm";
import { Store } from "@subsquid/typeorm-store";
import EntityBuffer from "./entityBuffer";
import { convertAmountToHuman } from "../_utils";
import { inferGeneralPoolId } from "./pools";

function getLatestCurrencyPairCumulativeVolume(
    cumulativeVolumes: CumulativeVolumePerCurrencyPair[],
    atOrBeforeTimestamp: Date,
    collateralCurrency: Currency,
    wrappedCurrency: Currency
): CumulativeVolumePerCurrencyPair | undefined {
    if (cumulativeVolumes.length < 1) {
        return undefined;
    }

    return cumulativeVolumes
        .filter(
            (entity) =>
                entity.tillTimestamp.getTime() <= atOrBeforeTimestamp.getTime()
        )
        .filter(
            (entity) =>
                entity.collateralCurrency?.toJSON().toString() ===
                collateralCurrency.toJSON().toString()
        )
        .filter(
            (entity) =>
                entity.wrappedCurrency?.toJSON().toString() ===
                wrappedCurrency.toJSON().toString()
        )
        .reduce((prev, current) => {
            // if timestamps are equal, the larger amount is latest for accumulative amounts
            if (
                prev.tillTimestamp.getTime() === current.tillTimestamp.getTime()
            ) {
                return prev.amount > current.amount ? prev : current;
            }
            return prev.tillTimestamp.getTime() >
                current.tillTimestamp.getTime()
                ? prev
                : current;
        });
}

function getLatestCumulativeVolume(
    cumulativeVolumes: CumulativeVolume[],
    atOrBeforeTimestamp: Date
): CumulativeVolume | undefined {
    if (cumulativeVolumes.length < 1) {
        return undefined;
    }

    // find the latest entry that has a tillTimestamp of less than or equal to timestamp
    return cumulativeVolumes
        .filter(
            (entity) =>
                entity.tillTimestamp.getTime() <= atOrBeforeTimestamp.getTime()
        )
        .reduce((prev, current) => {
            // if timestamps are equal, the larger amount is latest for accumulative amounts
            if (
                prev.tillTimestamp.getTime() === current.tillTimestamp.getTime()
            ) {
                return prev.amount > current.amount ? prev : current;
            }
            return prev.tillTimestamp.getTime() >
                current.tillTimestamp.getTime()
                ? prev
                : current;
        });
}

export async function updateCumulativeVolumes(
    store: Store,
    type: VolumeType,
    amount: bigint,
    timestamp: Date,
    entityBuffer: EntityBuffer
): Promise<CumulativeVolume> {
    const id = `${type.toString()}-${timestamp.getTime().toString()}`;

    // find by id if it exists in either entity buffer or db
    const existingValueInBlock =
        (entityBuffer.getBufferedEntityBy(
            CumulativeVolume.name,
            id
        ) as CumulativeVolume) || (await store.get(CumulativeVolume, id));

    if (existingValueInBlock !== undefined) {
        // new event in same block, update total
        existingValueInBlock.amount += amount;
        return existingValueInBlock;
    } else {
        // new event in new block, insert new entity

        // get last entity in buffer, otherwise from DB
        const cumulativeVolumeEntitiesInBuffer = (
            entityBuffer.getBufferedEntities(
                CumulativeVolume.name
            ) as CumulativeVolume[]
        ).filter((entity) => entity.type === type);

        // find CumulativeVolume entities of specific type in buffer first
        const maybeLatestEntityInBuffer = getLatestCumulativeVolume(
            cumulativeVolumeEntitiesInBuffer,
            timestamp
        );
        const existingCumulativeVolume =
            maybeLatestEntityInBuffer ||
            (await store.get(CumulativeVolume, {
                where: {
                    tillTimestamp: LessThanOrEqual(timestamp),
                    type: type,
                },
                order: { tillTimestamp: "DESC" },
            }));
        let newCumulativeVolume = new CumulativeVolume({
            id,
            type,
            tillTimestamp: timestamp,
            amount: (existingCumulativeVolume?.amount || 0n) + amount,
        });
        return newCumulativeVolume;
    }
}

export async function updateCumulativeVolumesForCurrencyPair(
    store: Store,
    type: VolumeType,
    amount: bigint,
    timestamp: Date,
    collateralCurrency: Currency,
    wrappedCurrency: Currency,
    entityBuffer: EntityBuffer
): Promise<CumulativeVolumePerCurrencyPair> {
    const currencyPairId = `${type.toString()}-${timestamp
        .getTime()
        .toString()}-${collateralCurrency?.toString()}-${wrappedCurrency?.toString()}`;

    // find by id if it exists in either entity buffer or database
    const existingValueInBlock =
        (entityBuffer.getBufferedEntityBy(
            CumulativeVolumePerCurrencyPair.name,
            currencyPairId
        ) as CumulativeVolumePerCurrencyPair) ||
        (await store.get(CumulativeVolumePerCurrencyPair, currencyPairId));

    if (existingValueInBlock !== undefined) {
        // new event in same block, update total
        existingValueInBlock.amount += amount;
        return existingValueInBlock;
    } else {
        // new event in new block, insert new entity

        // find CumulativeVolumePerCurrencyPair entities of specific type in buffer first
        const cumulativeEntitiesInBuffer = (
            entityBuffer.getBufferedEntities(
                CumulativeVolumePerCurrencyPair.name
            ) as CumulativeVolumePerCurrencyPair[]
        ).filter((entity) => entity.type === type);

        // get last cumulative amount in buffer, otherwise from DB
        const maybeLatestAmountInBuffer = getLatestCurrencyPairCumulativeVolume(
            cumulativeEntitiesInBuffer,
            timestamp,
            collateralCurrency,
            wrappedCurrency
        )?.amount;
        const existingCumulativeVolumeForCollateral =
            maybeLatestAmountInBuffer ||
            (
                await store.get(CumulativeVolumePerCurrencyPair, {
                    where: {
                        tillTimestamp: LessThanOrEqual(timestamp),
                        type: type,
                        collateralCurrency: Equal(collateralCurrency),
                        wrappedCurrency: Equal(wrappedCurrency),
                    },
                    order: { tillTimestamp: "DESC" },
                })
            )?.amount ||
            0n;
        let cumulativeVolumeForCollateral = new CumulativeVolumePerCurrencyPair(
            {
                id: currencyPairId,
                type,
                tillTimestamp: timestamp,
                amount: existingCumulativeVolumeForCollateral + amount,
                amountHuman: await convertAmountToHuman(collateralCurrency, existingCumulativeVolumeForCollateral + amount),
                collateralCurrency,
                wrappedCurrency,
            }
        );
        return cumulativeVolumeForCollateral;
    }
}

type SwapDetailsAmount = {
    currency: PooledToken,
    atomicAmount: bigint
};

export type SwapDetails = {
    from: SwapDetailsAmount,
    to: SwapDetailsAmount
}

async function createPooledAmount(swapAmount: SwapDetailsAmount): Promise<PooledAmount> {
    const amountHuman = await convertAmountToHuman(swapAmount.currency, swapAmount.atomicAmount);
    return new PooledAmount({
        token: swapAmount.currency,
        amount: swapAmount.atomicAmount,
        amountHuman
    });
}

/**
 * Modifies the passed in entity to add or update pooled token volumes.
 * @param entity The entity to add pooled amounts to, or update existing ones
 * @param swapDetails The swap details used to modify the event
 * @return Returns the modified entity
 */
async function updateOrAddPooledAmounts(entity: CumulativeDexTradingVolumePerPool, swapDetails: SwapDetails): Promise<CumulativeDexTradingVolumePerPool> {
    // we need to find & update existing amounts, or add new ones
    let foundFrom = false;
    let foundTo = false;
    
    for (const pooledAmount of entity.amounts) {
        if (foundFrom && foundTo) {
            // done: exit loop
            break;
        }

        let amountToAdd: bigint | undefined = undefined;
        if (pooledAmount.token === swapDetails.from.currency) {
            amountToAdd = swapDetails.from.atomicAmount;
            foundFrom = true;
        } else if (pooledAmount.token === swapDetails.to.currency) {
            amountToAdd = swapDetails.to.atomicAmount;
            foundTo = true;
        }

        // update volume in place (ie. modify the entity directly)
        if (amountToAdd) {
            const newAmount = pooledAmount.amount + swapDetails.to.atomicAmount;
            pooledAmount.amount = newAmount;
            pooledAmount.amountHuman = await convertAmountToHuman(pooledAmount.token, newAmount);
        }
    }

    // if we get here, there is at least one new pooled amount to add to the entity
    if (!foundFrom) {
        const pooledAmount = await createPooledAmount(swapDetails.from);
        entity.amounts.push(pooledAmount);
    }
    if (!foundTo) {
        const pooledAmount = await createPooledAmount(swapDetails.to);
        entity.amounts.push(pooledAmount);
    }

    return entity;
}

async function fetchOrCreateEntity(
    entityId: string, 
    poolId: string, 
    poolType: PoolType, 
    tillTimestamp: Date, 
    store: Store, 
    entityBuffer: EntityBuffer
): Promise<CumulativeDexTradingVolumePerPool> {
    // fetch from buffer if it exists
    return (entityBuffer.getBufferedEntityBy(
            CumulativeDexTradingVolumePerPool.name,
            entityId
        ) as CumulativeDexTradingVolumePerPool | undefined) ||
        // if not found, try to fetch from store
        (await store.get(CumulativeDexTradingVolumePerPool, entityId)) ||
        // still not found, create a new entity
        new CumulativeDexTradingVolumePerPool({
            id: entityId,
            poolId: poolId,
            poolType,
            tillTimestamp,
            amounts: []
        });
}

function buildPoolEntityId(poolId: string, poolType: PoolType, timestamp: Date): string {
    return `${poolId}-${poolType}-${timestamp
        .getTime()
        .toString()}`;
}

export async function updateCumulativeDexVolumesForStandardPool(
    store: Store,
    timestamp: Date,
    swapDetails: SwapDetails,
    entityBuffer: EntityBuffer
): Promise<CumulativeDexTradingVolumePerPool> {
    const poolType = PoolType.Standard;

    const poolId = inferGeneralPoolId(swapDetails.from.currency, swapDetails.to.currency);

    const entityId = buildPoolEntityId(poolId, poolType, timestamp);

    const entity = await fetchOrCreateEntity(entityId, poolId, poolType, timestamp, store, entityBuffer);
    return await updateOrAddPooledAmounts(entity, swapDetails);
}

export async function updateCumulativeDexVolumesForStablePool(
    store: Store,
    timestamp: Date,
    poolId: number,
    swapDetails: SwapDetails,
    entityBuffer: EntityBuffer
): Promise<CumulativeDexTradingVolumePerPool> {
    const poolType = PoolType.Stable;

    const entityId = buildPoolEntityId(poolId.toString(), poolType, timestamp);

    const entity = await fetchOrCreateEntity(entityId, poolId.toString(), poolType, timestamp, store, entityBuffer);
    return await updateOrAddPooledAmounts(entity, swapDetails);
}