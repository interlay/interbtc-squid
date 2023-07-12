import { Store } from "@subsquid/typeorm-store";
import EntityBuffer from "./entityBuffer";
import { CumulativeCirculatingSupply, Height, NativeToken, Token, TokenLock } from "../../model";
import { LessThan } from "typeorm";
import { cloneTimestampedEntity } from "./cloneHelpers";
import { convertAmountToHuman } from "../_utils";
import { BigDecimal } from "@subsquid/big-decimal";
import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx } from "../../processor";

// initial supply in atomic units
const INITIAL_SUPPLY = {
    INTR: 10_000_000_000_000_000_000n,
    KINT: 10_000_000_000_000_000_000n
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
    const locked = entity.amountLocked;
    const reserved = entity.amountReserved;
    const system = entity.amountSystemAccounts;

    const circulating = 0n - locked - reserved - system;
    const circulatingHuman = await convertAmountToHuman(entity.currency, circulating);

    entity.amountCirculating = circulating;
    entity.amountCirculatingHuman = circulatingHuman;
    return entity;
}

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
        return cloneTimestampedEntity(maybeEntity, entityId, tillTimestamp);
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
        return cloneTimestampedEntity(maybeEntity, entityId, tillTimestamp);
    }

    // not found in buffer or store, create new empty one, with only initialized issued amounts set
    const totalSupply = nativeToken === Token.KINT ? INITIAL_SUPPLY.KINT : INITIAL_SUPPLY.INTR;

    // convert Token to NativeToken for convertAmountToHuman helper method
    const tokenAsCurrency = new NativeToken({token: nativeToken});
    const totalSupplyHuman = await convertAmountToHuman(tokenAsCurrency, totalSupply);

    return new CumulativeCirculatingSupply({
        id: entityId,
        tillTimestamp,
        height,
        symbol: nativeToken,
        currency: tokenAsCurrency,
        // the caller needs to recalculate circulating supply
        amountCirculating: 0n,
        amountCirculatingHuman: BigDecimal(0.0),
        totalSupply,
        totalSupplyHuman,
        amountLocked: 0n,
        amountLockedHuman: BigDecimal(0.0),
        amountReserved: 0n,
        amountReservedHuman: BigDecimal(0.0),
        amountSystemAccounts: 0n,
        amountSystemAccountsHuman: BigDecimal(0.0)
    });
}

export async function fetchTokenLockIfExists(
    entityBuffer: EntityBuffer,
    store: Store,
    id: string
): Promise<TokenLock | undefined> {
    // first: look in entity buffer for locked entity
    const maybeEntity = entityBuffer.getBufferedEntityBy(TokenLock.name, id);

    if (maybeEntity !== undefined) {
        return maybeEntity as TokenLock;
    }

    // if not found in buffer, try to find it in the data store
    return await store.get(TokenLock, id);
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

    const entityId = `${nativeToken}_${blockTimestamp.getTime().toString()}`;

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