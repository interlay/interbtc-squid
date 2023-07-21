import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx, EventItem, getCirculatingSupplyProcessRange } from "../../processor";
import {
    TokensReservedEvent,
    TokensUnreservedEvent,
    TokensLockedEvent,
    TokensUnlockedEvent,
    TokensDepositedEvent,
    TokensWithdrawnEvent,
    TokensTransferEvent
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
import { address, currencyId, isSystemAddress, legacyCurrencyId } from "../encoding";
import { CumulativeCirculatingSupply, Currency, Token, Transfer } from "../../model";
import { convertAmountToHuman } from "../_utils";

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

export async function tokensTransfer(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensTransferEvent(ctx, item.event);
    let amount: bigint;
    let to: Uint8Array;
    let from: Uint8Array;
    let eventCcyId:
        | CurrencyId_V6
        | CurrencyId_V10
        | CurrencyId_V15
        | CurrencyId_V17
        | CurrencyId_V1020000
        | CurrencyId_V1021000
    let currency: Currency;
    if (rawEvent.isV6 || rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV6) {
            [eventCcyId, from, to, amount] = rawEvent.asV6;
        } else if (rawEvent.isV10) {
            ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV10);
        } else {
            ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV15);
        }
        currency = legacyCurrencyId.encode(eventCcyId);
    } else {
        if (rawEvent.isV17)
            ({ currencyId: eventCcyId, from, to, amount } = rawEvent.asV17);
        else if (rawEvent.isV1020000)
            ({
                currencyId: eventCcyId,
                from,
                to,
                amount,
            } = rawEvent.asV1020000);
        else if (rawEvent.isV1021000)
            ({
                currencyId: eventCcyId,
                from,
                to,
                amount,
            } = rawEvent.asV1021000);
        else {
            ctx.log.warn(`UNKOWN EVENT VERSION: tokens.transfer`);
            return;
        }

        currency = currencyId.encode(eventCcyId);
    }

    const height = await blockToHeight(ctx, block.height, "TokensTransfer");
    const amountHuman = await convertAmountToHuman(currency, amount);

    const fromAccount = address.interlay.encode(from);
    const toAccount = address.interlay.encode(to);

    entityBuffer.pushEntity(
        Transfer.name,
        new Transfer({
            id: item.event.id,
            height,
            timestamp: new Date(block.timestamp),
            from: fromAccount,
            to: toAccount,
            token: currency,
            amount,
            amountHuman,
        })
    );

    const circulatingSupplyRangeFrom = getCirculatingSupplyProcessRange().range?.from || 0;
    if (block.height < circulatingSupplyRangeFrom) {
        // only start processing from the given height, otherwise exit early
        return;
    }

    // if the transfer is in the native currency and to/from a system account, 
    // we also want to update circulating supply counters
    const nativeCurrency = getNativeCurrency();

    if (!isSameCurrency(nativeCurrency, eventCcyId)) {
        // not an event in the native currency (KINT/INTR); skip processing
        return;
    }

    const isFromSysAccount = isSystemAddress(fromAccount);
    const isToSysAccount = isSystemAddress(toAccount);
    
    if (isFromSysAccount === isToSysAccount) {
        // poor man's !XOR:
        // true === true: both to and from are system accounts, 
        // false === false: neither is a system account
        // in either case, nothing else to do because circulating supply doesn't change
        return;
    }
        
    const updateType = isFromSysAccount ? UpdateType.SystemSupplyDecrease : UpdateType.SystemSupplyIncrease;

    const circulatingSupplyEntity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        updateType,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, circulatingSupplyEntity)
}

export async function tokensDeposited(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensDepositedEvent(ctx, item.event);
    let ccyId: CurrencyId_V17 | CurrencyId_V1020000 | CurrencyId_V1021000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV17) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.deposited`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    if (!isSameCurrency(nativeCurrency, ccyId)) {
        // not an event in the native currency (KINT/INTR); skip processing
        return;
    }

    const account = address.interlay.encode(accountId);

    // only process system accounts; their deposits/withdrawals impact circulating supply
    if (!isSystemAddress(account)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensDeposited");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.SystemSupplyIncrease,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
}

export async function tokensWithdrawn(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new TokensWithdrawnEvent(ctx, item.event);
    let ccyId: CurrencyId_V17 | CurrencyId_V1020000 | CurrencyId_V1021000;
    let accountId: Uint8Array;
    let amount: bigint;

    if (rawEvent.isV17) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({currencyId: ccyId, who: accountId, amount} = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: tokens.withdrawn`);
        return;
    }

    const nativeCurrency = getNativeCurrency();

    if (!isSameCurrency(nativeCurrency, ccyId)) {
        // not an event in the native currency (KINT/INTR); skip processing
        return;
    }

    const account = address.interlay.encode(accountId);

    // only process system accounts; their deposits/withdrawals impact circulating supply
    if (!isSystemAddress(account)) {
        return;
    }

    const height = await blockToHeight(ctx, block.height, "TokensWithdrawn");
    const entity = await updateCumulativeCirculatingSupply(
        ctx,
        block,
        height,
        nativeCurrency,
        amount,
        UpdateType.SystemSupplyDecrease,
        entityBuffer
    );

    entityBuffer.pushEntity(CumulativeCirculatingSupply.name, entity);
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
