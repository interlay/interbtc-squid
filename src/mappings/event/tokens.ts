import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx, EventItem } from "../../processor";
import {
    TokensReservedEvent,
    TokensUnreservedEvent,
    TokensLockedEvent,
    TokensUnlockedEvent
} from "../../types/events";
import { CurrencyId as CurrencyId_V1 } from "../../types/v1";
import { CurrencyId as CurrencyId_V6 } from "../../types/v6";
import { CurrencyId as CurrencyId_V10 } from "../../types/v10";
import { CurrencyId as CurrencyId_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { CurrencyId as CurrencyId_V1020000 } from "../../types/v1020000";
import { CurrencyId as CurrencyId_V1021000 } from "../../types/v1021000";
import { CurrencyId as CurrencyId_V1024000 } from "../../types/v1024000";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { getNativeCurrency } from "../utils/nativeCurrency";
import { UpdateType, updateCumulativeCirculatingSupply } from "../utils/cumulativeCirculatingSupply";
import { address, isSystemAddress } from "../encoding";
import { CumulativeCirculatingSupply, Token } from "../../model";

function isSameCurrency(
    expectedNativeCurrency: Token.INTR | Token.KINT,
    currencyId: CurrencyId_V1 |
        CurrencyId_V6 |
        CurrencyId_V10 |
        CurrencyId_V15 |
        CurrencyId_V17 |
        CurrencyId_V1020000 |
        CurrencyId_V1021000
) : boolean {
    return currencyId.__kind === expectedNativeCurrency || 
    (currencyId.__kind === "Token" && currencyId.value.__kind === expectedNativeCurrency);

}

export async function tokensLocked(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensLockedEvent(ctx, item.event);
    let ccyId: CurrencyId_V1024000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV1024000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1024000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.locked`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    if (!isSameCurrency(nativeCurrency, ccyId)) {
        // not an event in the native currency (KINT/INTR); skip processing
        return;
    }

    const account = address.interlay.encode(accountId);

    // ignore if a system address, no change to circulation
    if (isSystemAddress(account)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensLocked");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.Locked,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
}

export async function tokensUnlocked(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensUnlockedEvent(ctx, item.event);

    let ccyId: CurrencyId_V1024000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV1024000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1024000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.unlocked`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    if (!isSameCurrency(nativeCurrency, ccyId)) {
        // not an event in the native currency (KINT/INTR); skip processing
        return;
    }

    const account = address.interlay.encode(accountId);

    // ignore if a system address, no change to circulation
    if (isSystemAddress(account)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensUnlocked");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.Unlocked,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
}

export async function tokensReserved(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensReservedEvent(ctx, item.event);
    let ccyId: CurrencyId_V1 |
        CurrencyId_V6 |
        CurrencyId_V10 |
        CurrencyId_V15 |
        CurrencyId_V17 |
        CurrencyId_V1020000 |
        CurrencyId_V1021000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV1) {
        [ccyId, accountId, amount] = rawEvent.asV1;
    } else if (rawEvent.isV6) {
        [ccyId, accountId, amount] = rawEvent.asV6;
    } else if (rawEvent.isV10) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV10);
    } else if (rawEvent.isV15) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV15);
    } else if (rawEvent.isV17) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.reserved`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    // not an event in the native currency (KINT/INTR); skip processing
    if (!isSameCurrency(nativeCurrency, ccyId)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensReserved");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.Reserved,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
}

export async function tokensUnreserved(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensUnreservedEvent(ctx, item.event);
    let ccyId: CurrencyId_V1 |
        CurrencyId_V6 |
        CurrencyId_V10 |
        CurrencyId_V15 |
        CurrencyId_V17 |
        CurrencyId_V1020000 |
        CurrencyId_V1021000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV1) {
        [ccyId, accountId, amount] = rawEvent.asV1;
    } else if (rawEvent.isV6) {
        [ccyId, accountId, amount] = rawEvent.asV6;
    } else if (rawEvent.isV10) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV10);
    } else if (rawEvent.isV15) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV15);
    } else if (rawEvent.isV17) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.reserved`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    // not an event in the native currency (KINT/INTR); skip processing
    if (!isSameCurrency(nativeCurrency, ccyId)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensUnreserved");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.Unreserved,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
}
