import { EventHandlerContext } from "@subsquid/substrate-processor";
import { VolumeType } from "../../model";
import { EscrowDepositEvent, EscrowWithdrawEvent } from "../../types/events";
import { eventArgs, updateCumulativeVolumes } from "../_utils";
import { Store } from "@subsquid/typeorm-store";

export async function deposit(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new EscrowDepositEvent(ctx);
    let e;
    if (!rawEvent.isV6) ctx.log.warn(`UNKOWN EVENT VERSION: Escrow.deposit`);
    e = rawEvent.asV6;

    const timestamp = new Date(ctx.block.timestamp);

    if (e.amount != 0n) {
        await updateCumulativeVolumes(
            ctx.store,
            VolumeType.Staked,
            e.amount,
            timestamp
        );
    }
}

export async function withdraw(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new EscrowWithdrawEvent(ctx);
    let e;
    if (rawEvent.isV6) ctx.log.warn(`UNKOWN EVENT VERSION: Escrow.withdraw`);
    e = rawEvent.asV6;

    const timestamp = new Date(ctx.block.timestamp);

    if (e.amount != 0n) {
        await updateCumulativeVolumes(
            ctx.store,
            VolumeType.Staked,
            -e.amount,
            timestamp
        );
    }
}
