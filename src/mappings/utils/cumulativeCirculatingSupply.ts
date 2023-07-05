import { Store } from "@subsquid/typeorm-store";
import EntityBuffer from "./entityBuffer";
import { CumulativeCirculatingSupply, Height, NativeToken, Token } from "../../model";
import { LessThan } from "typeorm";
import { cloneTimestampedEntity } from "./cloneHelpers";
import { convertAmountToHuman } from "../_utils";
import { BigDecimal } from "@subsquid/big-decimal";

const INITIAL_SUPPLY = {
    INTR: 1_000_000_000n,
    KINT: 10_000_000n
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

async function calculateAndSetCirculatingSupply(
    entity: CumulativeCirculatingSupply
): Promise<CumulativeCirculatingSupply> {
    const locked = entity.amountLocked;
    const reserved = entity.amountReserved;
    const issued = entity.amountIssued;

    const circulating = issued - locked - reserved;
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
    const amountIssued = nativeToken === Token.KINT ? INITIAL_SUPPLY.KINT : INITIAL_SUPPLY.INTR;

    // convert Token to NativeToken for convertAmountToHuman helper method
    const tokenAsCurrency = new NativeToken({token: nativeToken});
    const amountIssuedHuman = await convertAmountToHuman(tokenAsCurrency, amountIssued);

    return new CumulativeCirculatingSupply({
        id: entityId,
        tillTimestamp,
        height,
        symbol: nativeToken,
        currency: tokenAsCurrency,
        // the caller needs to recalculate circulating supply
        amountCirculating: 0n,
        amountCirculatingHuman: BigDecimal(0.0),
        amountIssued,
        amountIssuedHuman,
        amountLocked: 0n,
        amountLockedHuman: BigDecimal(0.0),
        amountReserved: 0n,
        amountReservedHuman: BigDecimal(0.0)
    });
}
