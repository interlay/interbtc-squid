import { Store } from "@subsquid/typeorm-store";
import EntityBuffer from "./entityBuffer";
import { CumulativeCirculatingSupply, Height, NativeToken, Token } from "../../model";
import { LessThan } from "typeorm";
import { cloneTimestampedEntity } from "./cloneHelpers";
import { convertAmountToHuman } from "../_utils";
import { BigDecimal } from "@subsquid/big-decimal";
import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx } from "../../processor";

// initial supply in atomic units
const INITIAL_SUPPLY = {
    INTR: 9_999_999_890_005_921_599n,
    KINT: 9_999_748_814_073_161_340n
};

function isMainnet(): boolean {
    return process.env.BITCOIN_NETWORK?.toLowerCase() === "mainnet";
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
    const issuance = entity.totalSupply;
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
): Promise<Partial<CumulativeCirculatingSupply>> {
    const totalSupply = nativeToken === Token.KINT ? INITIAL_SUPPLY.KINT : INITIAL_SUPPLY.INTR;
    // convert Token to NativeToken for convertAmountToHuman helper method
    const currency = new NativeToken({token: nativeToken});
    const totalSupplyHuman = await convertAmountToHuman(currency, totalSupply);

    const baseInfo = {
        symbol: nativeToken,
        currency,
    };
    
    if (!isMainnet()) {
        // testnet values, just initialize all at zero
        return {
            ...baseInfo,
            amountCirculating: 0n,
            amountCirculatingHuman: BigDecimal(0.0),
            totalSupply,
            totalSupplyHuman,
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
            totalSupply,
            totalSupplyHuman,
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
            totalSupply,
            totalSupplyHuman,
            amountLocked: 1259736843162855811n,
            amountLockedHuman: BigDecimal("125973684.3162855811"),
            amountReserved: 21376357616400n,
            amountReservedHuman: BigDecimal("2137.63576164"),
            amountSystemAccounts: 7750146279748893489n,
            amountSystemAccountsHuman: BigDecimal("775014627.9748893489"),
        };
    }
};

async function fetchOrCreateCirculatingSupplyEntity(
    entityId: string,
    nativeToken: Token.KINT | Token.INTR,
    tillTimestamp: Date,
    height: Height,
    store: Store,
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

    // next, try to find latest matching entity in buffer to copy values from
    const bufferedEntities = entityBuffer.getBufferedEntities(CumulativeCirculatingSupply.name) as CumulativeCirculatingSupply[];
    maybeEntity = findEntityBefore(bufferedEntities, tillTimestamp);

    if (maybeEntity !== undefined) {
        const clone = cloneTimestampedEntity(maybeEntity, entityId, tillTimestamp);
        clone.height = height;
        return clone;
    }

    // not found in buffer, try store next
    maybeEntity = await store.get(CumulativeCirculatingSupply, entityId);
    if (maybeEntity !== undefined) {
        return maybeEntity;
    }

    // try to find latest matching entity before tillTimestamp
    maybeEntity = await store.get(CumulativeCirculatingSupply, {
        where: { 
            tillTimestamp: LessThan(tillTimestamp),
        },
        order: { tillTimestamp: "DESC" },
    });

    if (maybeEntity) {
        const clone = cloneTimestampedEntity(maybeEntity, entityId, tillTimestamp);
        clone.height = height;
        return clone;
    }

    const initialSupplyValues = await getInitialSupplyValues(nativeToken);

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
        entityId,
        nativeToken,
        blockTimestamp,
        height,
        ctx.store,
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