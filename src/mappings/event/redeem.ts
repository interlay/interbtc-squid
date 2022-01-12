import * as ss58 from "@subsquid/ss58"
import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import Debug from "debug";
import {
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemRequest,
    RedeemStatus,
} from "../../model";
import { RedeemCancelRedeemEvent, RedeemExecuteRedeemEvent, RedeemRequestRedeemEvent } from "../../types/events";
import { blockToHeight } from "../_utils";

const debug = Debug("interbtc-mappings:redeem");

export async function requestRedeem(ctx: EventHandlerContext): Promise<void> {
    // const [
    //     id,
    //     userParachainAddress,
    //     requestedAmountBacking,
    //     bridgeFee,
    //     collateralPremium,
    //     vaultParachainAddress,
    //     userBackingAddress,
    //     btcTransferFee,
    // ] = new RedeemCrate.RequestRedeemEvent(event).params;
    const e = new RedeemRequestRedeemEvent(ctx).asLatest

    const redeem = new Redeem({
        id: toHex(e.redeemId),
        bridgeFee: e.fee,
        collateralPremium: e.premium,
        userParachainAddress: ss58.codec(42).encode(e.redeemer),
        vaultParachainAddress: ss58.codec(42).encode(e.vaultId.accountId),
        userBackingAddress: toHex(e.btcAddress.value),
        btcTransferFee: e.transferFee,
        status: RedeemStatus.Pending,
    });
    const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");

    redeem.request = new RedeemRequest({
        requestedAmountBacking: e.amount,
        height: height.id,
        timestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(redeem);
}

export async function executeRedeem(ctx: EventHandlerContext): Promise<void> {
    const e = new RedeemExecuteRedeemEvent(ctx).asLatest;
    const redeem = await ctx.store.get(Redeem, { where: { id: toHex(e.redeemId) } });
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
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
    });
    redeem.status = RedeemStatus.Completed;
    await ctx.store.save(execution);
    await ctx.store.save(redeem);

    // TODO: call out to electrs and get payment info
}

export async function cancelRedeem(ctx: EventHandlerContext): Promise<void> {
    // const [
    //     id,
    //     _userParachainAddress,
    //     _vaultParachainAddress,
    //     slashedCollateral,
    //     newStatus,
    // ] = new RedeemCrate.CancelRedeemEvent(event).params;
    const e = new RedeemCancelRedeemEvent(ctx).asLatest
    const redeem = await ctx.store.get(Redeem, { where: { id: toHex(e.redeemId) } });
    if (redeem === undefined) {
        debug(
            "WARNING: CancelRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "CancelIssue");
    const cancellation = new RedeemCancellation({
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
        slashedCollateral: e.slashedAmount,
        reimbursed: e.status.__kind === 'Reimbursed',
    });
    redeem.status = e.status.__kind === 'Reimbursed'
        ? RedeemStatus.Reimbursed
        : RedeemStatus.Retried;
    await ctx.store.save(cancellation);
    await ctx.store.save(redeem);
}
