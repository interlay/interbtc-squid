import EntityBuffer from "./entityBuffer";
import { CumulativeCirculatingSupply, Height, NativeToken, Token } from "../../model";
import { LessThan } from "typeorm";
import { cloneTimestampedEntity } from "./cloneHelpers";
import { convertAmountToHuman } from "../_utils";
import { BigDecimal } from "@subsquid/big-decimal";
import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx } from "../../processor";
import { TokensTotalIssuanceStorage } from "../../types/storage";
import { CurrencyId as CurrencyId_V6 } from "../../types/v6";
import { CurrencyId as CurrencyId_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { CurrencyId as CurrencyId_V1020000 } from "../../types/v1020000";
import { CurrencyId as CurrencyId_V1021000 } from "../../types/v1021000";

// in-mem storage for latest total issuance number by block height
const totalIssuanceLatest = {
    height: 0,
    value: 0n,
};

function isMainnet(): boolean {
    return process.env.BITCOIN_NETWORK?.toLowerCase() === "mainnet";
}

async function getTotalIssuanceForHeight(
    ctx: Ctx,
    block: SubstrateBlock,
    nativeToken: Token.INTR | Token.KINT
): Promise<bigint> {
    if (totalIssuanceLatest.height === block.height) {
        return totalIssuanceLatest.value;
    }

    const totalIssuanceStorage = new TokensTotalIssuanceStorage(ctx, block);

    let totalIssuance: bigint;
    if (totalIssuanceStorage.isV1) {
        totalIssuance = await totalIssuanceStorage.getAsV1({ __kind: nativeToken});
    } else {
        const param = {
            __kind: "Token",
            value: {
                __kind: nativeToken as string,
            },
        }

        if (totalIssuanceStorage.isV6) {
            totalIssuance = await totalIssuanceStorage.getAsV6(param as CurrencyId_V6);
        } else if (totalIssuanceStorage.isV15) {
            totalIssuance = await totalIssuanceStorage.getAsV15(param as CurrencyId_V15);
        } else if (totalIssuanceStorage.isV17) {
            totalIssuance = await totalIssuanceStorage.getAsV17(param as CurrencyId_V17);
        } else if (totalIssuanceStorage.isV1020000) {
            totalIssuance = await totalIssuanceStorage.getAsV1020000(param as CurrencyId_V1020000);
        } else if (totalIssuanceStorage.isV1021000) {
            totalIssuance = await totalIssuanceStorage.getAsV1021000(param as CurrencyId_V1021000);
        } else {
            ctx.log.warn("UNKOWN STORAGE VERSION: tokens.totalIssuance`");
            // update height, to avoid more failed lookups for same height
            totalIssuanceLatest.height = block.height;
            // return last known value
            return totalIssuanceLatest.value;
        }
    }

    totalIssuanceLatest.height = block.height;
    totalIssuanceLatest.value = totalIssuance;

    return totalIssuance;
}

function findEntityBefore(
    timestampedEntities: CumulativeCirculatingSupply[],
    beforeTimestamp: Date,
    customFilter?: (elem: CumulativeCirculatingSupply) => boolean
): CumulativeCirculatingSupply | undefined {
    if (timestampedEntities.length < 1) {
        return undefined;
    }

    // find the latest entry that has a tillTimestamp of less than the search timestamp
    const timestampFiltered = timestampedEntities
        .filter(entity => entity.tillTimestamp.getTime() < beforeTimestamp.getTime());

    // apply custom filter (most likely checking poolId for volume per pool entities)
    const customFiltered = (customFilter == undefined) ? timestampFiltered : timestampFiltered.filter(customFilter);

    return customFiltered.reduce((prev: CumulativeCirculatingSupply | undefined, current) => {
        if (prev === undefined) {
            return current;
        }

        return prev.tillTimestamp.getTime() >
            current.tillTimestamp.getTime()
            ? prev
            : current;
    },
    undefined);
}

async function recalculateAndSetCirculatingSupply(
    entity: CumulativeCirculatingSupply
): Promise<CumulativeCirculatingSupply> {
    const issuance = entity.totalIssuance;
    const locked = entity.amountLocked;
    const reserved = entity.amountReserved;
    const system = entity.amountSystemAccounts;

    const circulating = issuance - locked - reserved - system;
    const circulatingHuman = await convertAmountToHuman(entity.currency, circulating);

    entity.amountCirculating = circulating;
    entity.amountCirculatingHuman = circulatingHuman;
    return entity;
}

async function getInitialSupplyValues(
    nativeToken: Token.KINT | Token.INTR,
    totalIssuance: bigint,
    totalIssuanceHuman: BigDecimal
): Promise<Partial<CumulativeCirculatingSupply>> {
    const currency = new NativeToken({token: nativeToken});
    const baseInfo = {
        symbol: nativeToken,
        currency,
    };
    
    if (!isMainnet()) {
        // testnet values: set all to zero except totalIssuance
        return {
            ...baseInfo,
            amountCirculating: 0n,
            amountCirculatingHuman: BigDecimal(0.0),
            totalIssuance,
            totalIssuanceHuman,
            amountLocked: 0n,
            amountLockedHuman: BigDecimal(0.0),
            amountReserved: 0n,
            amountReservedHuman: BigDecimal(0.0),
            amountSystemAccounts: 0n,
            amountSystemAccountsHuman: BigDecimal(0.0),
        };
    } else if (nativeToken == Token.KINT) {
        // Kintsugi mainnet
        // based on values at height 3250848
        return {
            ...baseInfo,
            amountCirculating: 1726786192496544711n,
            amountCirculatingHuman: BigDecimal("1726786.192496544711"),
            totalIssuance: 9999748814173261080n,
            totalIssuanceHuman: BigDecimal("9999748.814173261080"),
            amountLocked: 2427708919077633982n,
            amountLockedHuman: BigDecimal("2427708.919077633982"),
            amountReserved: 139573468643652n,
            amountReservedHuman: BigDecimal("139.573468643652"),
            amountSystemAccounts: 5845114129130438735n,
            amountSystemAccountsHuman: BigDecimal("5845114.129130438735"),
        }
    } else {
        // Interlay mainnet
        // based on values at height 2959963
        return {
            ...baseInfo,
            amountCirculating: 990095390736555899n,
            amountCirculatingHuman: BigDecimal("99009539.0736555899"),
            totalIssuance: 9_999_999_890_005_921_599n,
            totalIssuanceHuman: BigDecimal("999999989.0005921599"),
            amountLocked: 1259736843162855811n,
            amountLockedHuman: BigDecimal("125973684.3162855811"),
            amountReserved: 21376357616400n,
            amountReservedHuman: BigDecimal("2137.63576164"),
            amountSystemAccounts: 7750146279748893489n,
            amountSystemAccountsHuman: BigDecimal("775014627.9748893489"),
        };
    }
};

function cloneCirculatingSupplyEntity(
    entity: CumulativeCirculatingSupply,
    entityId: string,
    tillTimestamp: Date,
    height: Height,
    totalIssuance: bigint | undefined,
    totalIssuanceHuman: BigDecimal | undefined
): CumulativeCirculatingSupply {
    const clone = cloneTimestampedEntity(entity, entityId, tillTimestamp);
    clone.height = height;

    if (totalIssuance !== undefined) {
        clone.totalIssuance = totalIssuance;
    }

    if (totalIssuanceHuman !== undefined) {   
        clone.totalIssuanceHuman = totalIssuanceHuman;    
    }

    return clone;
}

async function fetchOrCreateCirculatingSupplyEntity(
    ctx: Ctx,
    block: SubstrateBlock,
    entityId: string,
    nativeToken: Token.KINT | Token.INTR,
    tillTimestamp: Date,
    height: Height,
    entityBuffer: EntityBuffer
): Promise<CumulativeCirculatingSupply> {
    // first try to find by id
    let maybeEntity = entityBuffer.getBufferedEntityBy(
        CumulativeCirculatingSupply.name,
        entityId
    ) as CumulativeCirculatingSupply | undefined;

    if (maybeEntity !== undefined) {
        return maybeEntity;
    }

    // fetch latest total issuance
    const totalIssuance = await getTotalIssuanceForHeight(ctx, block, nativeToken);
    const nativeCurrency = new NativeToken({token: nativeToken});
    const totalIssuanceHuman = await convertAmountToHuman(nativeCurrency, totalIssuance);

    // next, try to find latest matching entity in buffer to copy values from
    const bufferedEntities = entityBuffer.getBufferedEntities(CumulativeCirculatingSupply.name) as CumulativeCirculatingSupply[];
    maybeEntity = findEntityBefore(bufferedEntities, tillTimestamp);

    if (maybeEntity !== undefined) {
        return cloneCirculatingSupplyEntity(maybeEntity, entityId, tillTimestamp, height, totalIssuance, totalIssuanceHuman);
    }

    // not found in buffer, try store next
    maybeEntity = await ctx.store.get(CumulativeCirculatingSupply, entityId);
    if (maybeEntity !== undefined) {
        return maybeEntity;
    }

    // try to find latest matching entity before tillTimestamp
    maybeEntity = await ctx.store.get(CumulativeCirculatingSupply, {
        where: { 
            tillTimestamp: LessThan(tillTimestamp),
        },
        order: { tillTimestamp: "DESC" },
    });

    if (maybeEntity) {
        return cloneCirculatingSupplyEntity(maybeEntity, entityId, tillTimestamp, height, totalIssuance, totalIssuanceHuman);
    }

    const initialSupplyValues = await getInitialSupplyValues(nativeToken, totalIssuance, totalIssuanceHuman);

    return new CumulativeCirculatingSupply({
        ...initialSupplyValues,
        id: entityId,
        tillTimestamp,
        height,
    });
}

export enum UpdateType {
    Locked,
    Unlocked,
    Reserved,
    Unreserved,
    SystemSupplyIncrease,
    SystemSupplyDecrease
}

export async function updateCumulativeCirculatingSupply(
    ctx: Ctx,
    block: SubstrateBlock,
    height: Height,
    nativeToken: Token.KINT | Token.INTR,
    amount: bigint,
    type: UpdateType,
    entityBuffer: EntityBuffer
): Promise<CumulativeCirculatingSupply> {
    const blockTimestamp = new Date(block.timestamp);

    const entityId = `${nativeToken}_${block.height}`;

    // fetch latest cumulative supply entity
    const entity = await fetchOrCreateCirculatingSupplyEntity(
        ctx,
        block,
        entityId,
        nativeToken,
        blockTimestamp,
        height,
        entityBuffer
    );

    const nativeCurrency = new NativeToken({token: nativeToken});

    switch(type) {
        case UpdateType.Locked:
            entity.amountLocked += amount;
            entity.amountLockedHuman = await convertAmountToHuman(nativeCurrency, entity.amountLocked);
            break;
        case UpdateType.Unlocked:
            entity.amountLocked -= amount;
            entity.amountLockedHuman = await convertAmountToHuman(nativeCurrency, entity.amountLocked);
            break;
        case UpdateType.Reserved:
            entity.amountReserved += amount;
            entity.amountReservedHuman = await convertAmountToHuman(nativeCurrency, entity.amountReserved);
            break;
        case UpdateType.Unreserved:
            entity.amountReserved -= amount;
            entity.amountReservedHuman = await convertAmountToHuman(nativeCurrency, entity.amountReserved);
            break;
        case UpdateType.SystemSupplyIncrease:
            entity.amountSystemAccounts += amount;
            entity.amountSystemAccountsHuman = await convertAmountToHuman(nativeCurrency, entity.amountSystemAccounts);
            break;
        case UpdateType.SystemSupplyDecrease:
            entity.amountSystemAccounts -= amount;
            entity.amountSystemAccountsHuman = await convertAmountToHuman(nativeCurrency, entity.amountSystemAccounts);
            break;
        default:
            ctx.log.warn(`Unhandled update type in updateCumulativeCirculatingSupply: ${type}`);
    }

    return recalculateAndSetCirculatingSupply(entity);
}