import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import Debug from "debug";
import { LessThanOrEqual } from "typeorm";
import {
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemPeriod,
    RedeemRequest,
    RedeemStatus,
    RelayedBlock,
    VolumeType,
} from "../../model";
import {
    RedeemCancelRedeemEvent,
    RedeemExecuteRedeemEvent,
    RedeemRedeemPeriodChangeEvent,
    RedeemRequestRedeemEvent,
} from "../../types/events";
import { address, currencyId, encodeVaultId } from "../encoding";
import { blockToHeight, getCurrentRedeemPeriod, getVaultId, updateCumulativeVolumes } from "../_utils";

const debug = Debug("interbtc-mappings:redeem");

export async function requestRedeem(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new RedeemRequestRedeemEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else throw Error("Unknown event version");

    const vaultId = await getVaultId(ctx.store, e.vaultId);
    if (vaultId === undefined) {
        debug(
            `WARNING: no vault ID found for issue request ${toHex(
                e.redeemId
            )}, with encoded account-wrapped-collateral ID of ${encodeVaultId(
                e.vaultId
            )} (at parachain absolute height ${ctx.block.height}`
        );
        return;
    }

    const period = await getCurrentRedeemPeriod(ctx.store);

    const redeem = new Redeem({
        id: toHex(e.redeemId),
        bridgeFee: e.fee,
        collateralPremium: e.premium,
        userParachainAddress: address.interlay.encode(e.redeemer),
        vault: vaultId,
        userBackingAddress: address.btc.encode(e.btcAddress),
        btcTransferFee: e.transferFee,
        status: RedeemStatus.Pending,
        period
    });
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RequestIssue"
    );

    const backingBlock = await ctx.store.get(RelayedBlock, {
        order: { backingHeight: "DESC" },
        relations: ["relayedAtHeight"],
        where: {
            relayedAtHeight: {
                absolute: LessThanOrEqual(height.absolute),
            },
        },
    });

    if (backingBlock === undefined) {
        debug(
            `WARNING: no BTC blocks relayed before redeem request ${redeem.id} (at parachain absolute height ${height.absolute})`
        );
    }

    redeem.request = new RedeemRequest({
        requestedAmountBacking: e.amount,
        height: height.id,
        timestamp: new Date(ctx.block.timestamp),
        backingHeight: backingBlock?.backingHeight || 0,
    });

    await ctx.store.save(redeem);
}

export async function executeRedeem(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new RedeemExecuteRedeemEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else throw Error("Unknown event version");

    const redeem = await ctx.store.get(Redeem, {
        where: { id: toHex(e.redeemId) },
    });
    if (redeem === undefined) {
        debug(
            "WARNING: ExecuteRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "ExecuteRedeem"
    );
    const execution = new RedeemExecution({
        id: redeem.id,
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
    });
    redeem.status = RedeemStatus.Completed;
    await ctx.store.save(execution);
    await ctx.store.save(redeem);

    await updateCumulativeVolumes(
        ctx.store,
        VolumeType.Redeemed,
        redeem.request.requestedAmountBacking,
        new Date(ctx.block.timestamp),
        currencyId.token.encode(e.vaultId.currencies.collateral),
        currencyId.token.encode(e.vaultId.currencies.wrapped)
    );
}

export async function cancelRedeem(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new RedeemCancelRedeemEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else throw Error("Unknown event version");

    const redeem = await ctx.store.get(Redeem, {
        where: { id: toHex(e.redeemId) },
    });
    if (redeem === undefined) {
        debug(
            "WARNING: CancelRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "CancelIssue"
    );
    const cancellation = new RedeemCancellation({
        id: redeem.id,
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
        slashedCollateral: e.slashedAmount,
        reimbursed: e.status.__kind === "Reimbursed",
    });
    redeem.status =
        e.status.__kind === "Reimbursed"
            ? RedeemStatus.Reimbursed
            : RedeemStatus.Retried;
    await ctx.store.save(cancellation);
    await ctx.store.save(redeem);
}

export async function redeemPeriodChange(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new RedeemRedeemPeriodChangeEvent(ctx);
    let e;
    if (rawEvent.isV16) e = rawEvent.asV16;
    else throw Error("Unknown event version");

    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RedeemPeriodChange"
    );
    
    const redeemPeriod = new RedeemPeriod({
        height,
        timestamp: new Date(ctx.block.timestamp),
        value: e.period
    })

    await ctx.store.save(redeemPeriod);
}
