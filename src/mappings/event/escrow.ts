import Debug from "debug";
import { EventHandlerContext } from "@subsquid/substrate-processor";
import { VolumeType } from "../../model";
import { EscrowDepositEvent, EscrowWithdrawEvent } from "../../types/events";
import { updateCumulativeVolumes } from "../_utils";

const debug = Debug("interbtc-mappings:escrow");

export async function deposit(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new EscrowDepositEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else e = rawEvent.asLatest;

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

export async function withdraw(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new EscrowWithdrawEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else e = rawEvent.asLatest;

    debug(`Handling escrow withdraw event!`);

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
