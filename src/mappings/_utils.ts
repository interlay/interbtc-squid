import { Store } from "@subsquid/substrate-processor";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Height,
    Issue,
    RelayedBlock,
    Token,
    Vault,
    VolumeType,
} from "../model";
import { LessThanOrEqual } from "typeorm";
import debug from "debug";
import { VaultId as EventVaultId } from "../types/v1";
import { encodeVaultId } from "./encoding";

const issuePeriod = 14400; // TODO: HARDCODED - fetch from chain once event is implemented
const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?
const btcPeriod = Math.ceil(issuePeriod / parachainBlocksPerBitcoinBlock);

export async function getVaultId(store: Store, vaultId: EventVaultId) {
    return store.get(Vault, {
        where: { id: encodeVaultId(vaultId) },
    });
}

export async function blockToHeight(
    store: Store,
    absoluteBlock: number,
    eventName?: string // for logging purposes
): Promise<Height> {
    const createPlusSave = async (absolute: number, active: number) => {
        const height = new Height({
            id: absolute.toString(),
            absolute,
            active,
        });
        await store.save(height);
        return height;
    };

    const height = await store.get(Height, {
        where: { absolute: LessThanOrEqual(absoluteBlock) },
        order: { active: "DESC" },
    });
    if (height === undefined) {
        debug(
            `WARNING: Did not find Height entity for absolute block ${absoluteBlock}. This means the chain did not generate UpdateActiveBlock events priorly, yet other events are being processed${
                eventName ? ` (such as ${eventName})` : ""
            }, which may not be normal.`
        );
        return createPlusSave(absoluteBlock, 0);
    }

    if (height.absolute === absoluteBlock) {
        return height;
    } else {
        return createPlusSave(absoluteBlock, height.active);
    }
}

export async function isIssueExpired(
    store: Store,
    issue: Issue,
    latestBtcBlock: number,
    latestActiveBlock: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: issue.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet
    const requestBtcBlock = await store.get(RelayedBlock, {
        order: { backingHeight: "DESC" },
        relations: ["relayedAtHeight"],
        where: {
            relayedAtHeight: {
                absolute: LessThanOrEqual(requestHeight.absolute),
            },
        },
    });
    if (requestBtcBlock === undefined) return false; // no BTC blocks yet

    // console.log(`Checking expiry: opened at height ${requestHeight.active}, current latest block is ${latestActiveBlock}, issue period is ${issuePeriod}; btc height is ${requestBtcBlock.backingHeight}, latest btc is ${latestBtcBlock}, btc period is ${btcPeriod}`)

    return (
        requestBtcBlock.backingHeight + btcPeriod < latestBtcBlock &&
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
    const whereCommon = {
        tillTimestamp: LessThanOrEqual(timestamp),
        type: type,
    };
    const newVolumeCommon = {
        id: `${type.toString()}-${timestamp.getTime().toString()}`,
        type: type,
        tillTimestamp: timestamp,
    };

    // save the total sum (important for issue and redeem)
    const existingCumulativeVolume =
        (await store.get(CumulativeVolume, { where: whereCommon }))?.amount ||
        0n;
    let cumulativeVolume = new CumulativeVolume({
        ...newVolumeCommon,
        amount: existingCumulativeVolume + amount,
    });
    await store.save(cumulativeVolume);

    // also save the collateral-specific sum
    if (collateralCurrency || wrappedCurrency) {
        const existingCumulativeVolumeForCollateral =
            (
                await store.get(CumulativeVolumePerCurrencyPair, {
                    where: {
                        ...whereCommon,
                        collateralCurrency,
                        wrappedCurrency,
                    },
                })
            )?.amount || 0n;
        let cumulativeVolumeForCollateral = new CumulativeVolumePerCurrencyPair(
            {
                ...newVolumeCommon,
                id: `${
                    newVolumeCommon.id
                }-${collateralCurrency?.toString()}-${wrappedCurrency?.toString()}`,
                amount: existingCumulativeVolumeForCollateral + amount,
                collateralCurrency,
                wrappedCurrency,
            }
        );
        await store.save(cumulativeVolumeForCollateral);
    }
}
