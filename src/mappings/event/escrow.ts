import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Entity } from "@subsquid/typeorm-store";
import { CumulativeVolume, VolumeType } from "../../model";
import { Ctx, EventItem } from "../../processor";
import { EscrowDepositEvent, EscrowWithdrawEvent } from "../../types/events";
import { updateCumulativeVolumes } from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";

export async function deposit(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new EscrowDepositEvent(ctx, item.event);
    let e;
    if (!rawEvent.isV6) ctx.log.warn(`UNKOWN EVENT VERSION: Escrow.deposit`);
    e = rawEvent.asV6;

    const timestamp = new Date(block.timestamp);

    if (e.amount === 0n) return;
    await entityBuffer.pushEntity(
        CumulativeVolume.name,
        await updateCumulativeVolumes(
            ctx.store,
            VolumeType.Staked,
            e.amount,
            timestamp,
            item
        )
    );
}

export async function withdraw(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new EscrowWithdrawEvent(ctx, item.event);
    let e;
    if (!rawEvent.isV6) ctx.log.warn(`UNKOWN EVENT VERSION: Escrow.withdraw`);
    e = rawEvent.asV6;

    const timestamp = new Date(block.timestamp);

    if (e.amount === 0n) return;
    await entityBuffer.pushEntity(
        CumulativeVolume.name,
        await updateCumulativeVolumes(
            ctx.store,
            VolumeType.Staked,
            -e.amount,
            timestamp,
            item
        )
    );
}
