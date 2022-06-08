import { Store } from "@subsquid/substrate-processor";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Height,
    Issue,
    Redeem,
    Token,
    Vault,
    VolumeType,
} from "../model";
import { LessThanOrEqual } from "typeorm";
import Debug from "debug";
import { VaultId as VaultIdV6 } from "../types/v6";
import { VaultId as VaultIdV8 } from "../types/v8";
import { encodeVaultId } from "./encoding";

const debug = Debug("interbtc-mappings:_utils");

const issuePeriod = 14400; // TODO: HARDCODED - fetch from chain once event is implemented
const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?
const btcPeriod = Math.ceil(issuePeriod / parachainBlocksPerBitcoinBlock);

export async function getVaultId(store: Store, vaultId: VaultIdV6 | VaultIdV8) {
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
    latestActiveBlock: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: request.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet

    return (
        request.request.backingHeight + btcPeriod < latestBtcBlock &&
        requestHeight.active + issuePeriod < latestActiveBlock
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
    const existingCumulativeVolume =
        (
            await store.get(CumulativeVolume, {
                where: {
                    tillTimestamp: LessThanOrEqual(timestamp),
                    type: type,
                },
                order: { tillTimestamp: "DESC" },
            })
        )?.amount || 0n;
    let cumulativeVolume = new CumulativeVolume({
        id,
        type,
        tillTimestamp: timestamp,
        amount: existingCumulativeVolume + amount,
    });
    await store.save(cumulativeVolume);

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
