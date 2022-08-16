import { Store } from "@subsquid/substrate-processor";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Height,
    Issue,
    IssuePeriod,
    Redeem,
    RedeemPeriod,
    Token,
    Vault,
    VolumeType,
} from "../model";
import { LessThanOrEqual } from "typeorm";
import Debug from "debug";
import { VaultId as VaultIdV17 } from "../types/v17";
import { VaultId as VaultIdV15 } from "../types/v15";
import { VaultId as VaultIdV6 } from "../types/v6";
import { encodeVaultId } from "./encoding";

const debug = Debug("interbtc-mappings:_utils");

const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?

export async function getVaultId(
    store: Store,
    vaultId: VaultIdV17 | VaultIdV15 | VaultIdV6
) {
    return store.get(Vault, {
        where: { id: encodeVaultId(vaultId) },
    });
}

export async function blockToHeight(
    store: Store,
    absoluteBlock: number,
    eventName?: string // for logging purposes
): Promise<Height> {
    const existingBlockHeight = await store.get(Height, {
        where: { absolute: absoluteBlock },
    });
    if (existingBlockHeight !== undefined) {
        // was already set for current block, either by UpdateActiveBlock or previous invocation of blockToHeight
        return existingBlockHeight;
    } else {
        // not set for current block - get latest value of `active` and save Height for current block (if exists)
        const currentActive = (
            await store.get(Height, {
                where: { absolute: LessThanOrEqual(absoluteBlock) },
                order: { active: "DESC" },
            })
        )?.active;
        if (currentActive === undefined) {
            debug(
                `WARNING: Did not find Height entity for absolute block ${absoluteBlock}. This means the chain did not generate UpdateActiveBlock events priorly, yet other events are being processed${
                    eventName ? ` (such as ${eventName})` : ""
                }, which may not be normal.`
            );
        }
        const height = new Height({
            id: absoluteBlock.toString(),
            absolute: absoluteBlock,
            active: currentActive || 0,
        });
        await store.save(height);
        return height;
    }
}

export async function isRequestExpired(
    store: Store,
    request: Issue | Redeem,
    latestBtcBlock: number,
    latestActiveBlock: number,
    period: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: request.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet

    const btcPeriod = Math.ceil(period / parachainBlocksPerBitcoinBlock);

    return (
        request.request.backingHeight + btcPeriod < latestBtcBlock &&
        requestHeight.active + period < latestActiveBlock
    );
}

export async function updateCumulativeVolumes(
    store: Store,
    type: VolumeType,
    amount: bigint,
    timestamp: Date,
    collateralCurrency?: Token,
    wrappedCurrency?: Token
): Promise<void> {
    const id = `${type.toString()}-${timestamp.getTime().toString()}`;

    // save the total sum (important for issue and redeem)
    let existingValueInBlock = await store.get(CumulativeVolume, id);
    if (existingValueInBlock !== undefined) {
        // new event in same block, update total
        existingValueInBlock.amount += amount;
        await store.save(existingValueInBlock);
    } else {
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
            amount: existingCumulativeVolume?.amount || 0n + amount,
        });
        await store.save(newCumulativeVolume);
    }

    if (collateralCurrency || wrappedCurrency) {
        // also save the collateral-specific sum
        const existingCumulativeVolumeForCollateral =
            (
                await store.get(CumulativeVolumePerCurrencyPair, {
                    where: {
                        tillTimestamp: LessThanOrEqual(timestamp),
                        type: type,
                        collateralCurrency,
                        wrappedCurrency,
                    },
                    order: { tillTimestamp: "DESC" },
                })
            )?.amount || 0n;
        let cumulativeVolumeForCollateral = new CumulativeVolumePerCurrencyPair(
            {
                id: `${id}-${collateralCurrency?.toString()}-${wrappedCurrency?.toString()}`,
                type,
                tillTimestamp: timestamp,
                amount: existingCumulativeVolumeForCollateral + amount,
                collateralCurrency,
                wrappedCurrency,
            }
        );
        await store.save(cumulativeVolumeForCollateral);
    }
}

export async function getCurrentIssuePeriod(store: Store) {
    return await store.get(IssuePeriod, {
        order: { timestamp: "DESC" },
    });
}

export async function getCurrentRedeemPeriod(store: Store) {
    return await store.get(RedeemPeriod, {
        order: { timestamp: "DESC" },
    });
}

