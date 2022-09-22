import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Currency,
    VolumeType,
} from "../../model";
import { Equal, LessThanOrEqual } from "typeorm";
import { Store } from "@subsquid/typeorm-store";
import { EventItem } from "../../processor";

export async function updateCumulativeVolumes(
    store: Store,
    type: VolumeType,
    amount: bigint,
    timestamp: Date,
    item: EventItem
): Promise<CumulativeVolume> {
    const id = `${type.toString()}-${item.event.id}`;
    const existingValueInBlock = await store.get(CumulativeVolume, id);

    if (existingValueInBlock !== undefined) {
        // new event in same block, update total
        existingValueInBlock.amount += amount;
        return existingValueInBlock;
    } else {
        // new event in new block, insert new entity
        const existingCumulativeVolume = await store.get(CumulativeVolume, {
            where: {
                tillTimestamp: LessThanOrEqual(timestamp),
                type: type,
            },
            order: { tillTimestamp: "DESC" },
        });
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
    item: EventItem,
    collateralCurrency: Currency,
    wrappedCurrency: Currency
): Promise<CumulativeVolumePerCurrencyPair> {
    const currencyPairId = `${type.toString()}-${
        item.event.id
    }-${collateralCurrency?.toString()}-${wrappedCurrency?.toString()}`;
    const existingValueInBlock = await store.get(
        CumulativeVolumePerCurrencyPair,
        currencyPairId
    );

    if (existingValueInBlock !== undefined) {
        // new event in same block, update total
        existingValueInBlock.amount += amount;
        return existingValueInBlock;
    } else {
        // new event in new block, insert new entity
        const existingCumulativeVolumeForCollateral =
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
            )?.amount || 0n;
        let cumulativeVolumeForCollateral = new CumulativeVolumePerCurrencyPair(
            {
                id: currencyPairId,
                type,
                tillTimestamp: timestamp,
                amount: existingCumulativeVolumeForCollateral + amount,
                collateralCurrency,
                wrappedCurrency,
            }
        );
        return cumulativeVolumeForCollateral;
    }
}
