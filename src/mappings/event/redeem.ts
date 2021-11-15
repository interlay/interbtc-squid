import Debug from "debug";
import { EventContext, StoreContext } from "@subsquid/hydra-common";
import {
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemRequest,
    RedeemStatus,
} from "../../generated/model";
import { Redeem as RedeemCrate } from "../../types";
import { blockToHeight } from "../_utils";

const debug = Debug("interbtc-mappings:redeem");

export async function requestRedeem({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        userParachainAddress,
        requestedAmountBacking,
        bridgeFee,
        collateralPremium,
        vaultParachainAddress,
        userBackingAddress,
        btcTransferFee,
    ] = new RedeemCrate.RequestRedeemEvent(event).params;
    const redeem = new Redeem({
        id: id.toString(),
        bridgeFee: bridgeFee.toBigInt(),
        collateralPremium: collateralPremium.toBigInt(),
        userParachainAddress: userParachainAddress.toString(),
        vaultParachainAddress: vaultParachainAddress.toString(),
        userBackingAddress: userBackingAddress.toString(),
        btcTransferFee: btcTransferFee.toBigInt(),
        status: RedeemStatus.Pending,
    });
    const height = await blockToHeight({ store }, block.height, "RequestIssue");

    redeem.request = new RedeemRequest({
        requestedAmountBacking: requestedAmountBacking.toBigInt(),
        height: height.id,
        timestamp: new Date(block.timestamp),
    });

    await store.save(redeem);
}

export async function executeRedeem({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id] = new RedeemCrate.ExecuteRedeemEvent(event).params;
    const redeem = await store.get(Redeem, { where: { id: id.toString() } });
    if (redeem === undefined) {
        debug(
            "WARNING: ExecuteRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        { store },
        block.height,
        "ExecuteRedeem"
    );
    const execution = new RedeemExecution({
        redeem,
        height,
        timestamp: new Date(block.timestamp),
    });
    redeem.status = RedeemStatus.Completed;
    await Promise.all([store.save(execution), store.save(redeem)]);

    // TODO: call out to electrs and get payment info
}

export async function cancelRedeem({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        _userParachainAddress,
        _vaultParachainAddress,
        slashedCollateral,
        newStatus,
    ] = new RedeemCrate.CancelRedeemEvent(event).params;
    const redeem = await store.get(Redeem, { where: { id: id.toString() } });
    if (redeem === undefined) {
        debug(
            "WARNING: CancelRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight({ store }, block.height, "CancelIssue");
    const cancellation = new RedeemCancellation({
        redeem,
        height,
        timestamp: new Date(block.timestamp),
        slashedCollateral: slashedCollateral.toBigInt(),
        reimbursed: newStatus.isReimbursed,
    });
    redeem.status = newStatus.isReimbursed
        ? RedeemStatus.Reimbursed
        : RedeemStatus.Retried;
    await Promise.all([store.save(cancellation), store.save(redeem)]);
}
