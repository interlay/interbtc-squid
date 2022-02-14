import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import Debug from "debug";
import {
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemRequest,
    RedeemStatus,
    VolumeType,
} from "../../model";
import {
    RedeemCancelRedeemEvent,
    RedeemExecuteRedeemEvent,
    RedeemRequestRedeemEvent,
} from "../../types/events";
import { address, currencyId } from "../encoding";
import { blockToHeight, getVaultId, updateCumulativeVolumes } from "../_utils";

const debug = Debug("interbtc-mappings:redeem");

export async function requestRedeem(ctx: EventHandlerContext): Promise<void> {
    const e = new RedeemRequestRedeemEvent(ctx).asLatest;

    const vaultId = await getVaultId(ctx.store, e.vaultId);
    const redeem = new Redeem({
        id: toHex(e.redeemId),
        bridgeFee: e.fee,
        collateralPremium: e.premium,
        userParachainAddress: address.interlay.encode(e.redeemer),
        vault: vaultId,
        userBackingAddress: address.btc.encode(e.btcAddress),
        btcTransferFee: e.transferFee,
        status: RedeemStatus.Pending,
    });
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RequestIssue"
    );

    redeem.request = new RedeemRequest({
        requestedAmountBacking: e.amount,
        height: height.id,
        timestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(redeem);
}

export async function executeRedeem(ctx: EventHandlerContext): Promise<void> {
    const e = new RedeemExecuteRedeemEvent(ctx).asLatest;
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

    updateCumulativeVolumes(
        ctx.store,
        VolumeType.Redeemed,
        redeem.request.requestedAmountBacking,
        new Date(ctx.block.timestamp),
        currencyId.token.encode(e.vaultId.currencies.collateral),
        currencyId.token.encode(e.vaultId.currencies.wrapped)
    );
}

export async function cancelRedeem(ctx: EventHandlerContext): Promise<void> {
    const e = new RedeemCancelRedeemEvent(ctx).asLatest;
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
