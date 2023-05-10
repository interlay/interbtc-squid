import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx, EventItem } from "../../processor";
import { 
    TokensTotalIssuanceSetEvent,
    TokensReservedEvent,
    TokensUnreservedEvent
} from "../../types/events";
import { cumulativeSupply } from "../../server-extension/resolvers";
import EntityBuffer from "../utils/entityBuffer";


// This event signals a change in the total supply of native tokens INTR / KINT
export async function handleTokensTotalIssuanceSetEvent(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
    ): Promise<void> {

    const rawEvent = new TokensTotalIssuanceSetEvent(ctx, item.event);

    let amount: bigint;
    if (rawEvent.isV17) {
        ({ amount } = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({ amount } = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({ amount } = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKOWN EVENT VERSION: Tokens.TotalIssuanceSet`);
        return;
    }

    // Calculate the change in total supply
    const totalSupplyDelta = amount - cumulativeSupply.totalSupply;

    // Update the total supply and circulating supply in our singleton instance
    cumulativeSupply.totalSupply = amount;
    cumulativeSupply.circulatingSupply += totalSupplyDelta;
}

export async function handleTokensReservedEvent(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
    ): Promise<void> {

    const rawEvent = new TokensReservedEvent(ctx, item.event);

    let amount: bigint;
    if (rawEvent.isV1) {
        const [, , amount] = rawEvent.asV1;
    } else if (rawEvent.isV6) {
        const [, , amount] = rawEvent.asV6;
    } else if (rawEvent.isV10) {
        ({ amount } = rawEvent.asV10);
    } else if (rawEvent.isV15) {
        ({ amount } = rawEvent.asV15);
    } else if (rawEvent.isV17) {
        ({ amount } = rawEvent.asV17);
    } else if (rawEvent.isV1020000) {
        ({ amount } = rawEvent.asV1020000);
    } else if (rawEvent.isV1021000) {
        ({ amount } = rawEvent.asV1021000);
    } else {
        ctx.log.warn(`UNKNOWN EVENT VERSION: Tokens.Reserved`);
        return;
    }

    
}

export async function handleTokensUnreservedEvent(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
    ): Promise<void> {
        
}