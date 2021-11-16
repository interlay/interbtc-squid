import Debug from "debug";
import { EventContext, StoreContext } from "@subsquid/hydra-common";
import {
    Issue,
    IssueCancellation,
    IssueExecution,
    IssueRequest,
    IssueStatus,
    Refund,
} from "../../generated/model";
import { Issue as IssueCrate, Refund as RefundCrate } from "../../types";
import { blockToHeight } from "../_utils";

const debug = Debug("interbtc-mappings:issue");

export async function requestIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        userParachainAddress,
        amountWrapped,
        bridgeFee,
        griefingCollateral,
        vaultParachainAddress,
        vaultBackingAddress,
        vaultWalletPubkey,
    ] = new IssueCrate.RequestIssueEvent(event).params;
    const issue = new Issue({
        id: id.toString(),
        griefingCollateral: griefingCollateral.toBigInt(),
        userParachainAddress: userParachainAddress.toString(),
        vaultParachainAddress: vaultParachainAddress.toString(),
        vaultBackingAddress: vaultBackingAddress.toString(),
        vaultWalletPubkey: vaultWalletPubkey.toString(),
        status: IssueStatus.Pending,
    });
    const height = await blockToHeight({ store }, block.height, "RequestIssue");

    issue.request = new IssueRequest({
        amountWrapped: amountWrapped.toBigInt(),
        bridgeFeeWrapped: bridgeFee.toBigInt(),
        height: height.id,
        timestamp: new Date(block.timestamp),
    });

    await store.save(issue);
}

export async function executeIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        _userParachainAddress,
        amountWrapped, // TODO: double-check
        _vaultParachainAddress,
        fee,
    ] = new IssueCrate.ExecuteIssueEvent(event).params;
    const issue = await store.get(Issue, { where: { id: id.toString() } });
    if (issue === undefined) {
        debug(
            "WARNING: ExecuteIssue event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight({ store }, block.height, "ExecuteIssue");
    const execution = new IssueExecution({
        issue,
        amountWrapped: amountWrapped.toBigInt() - fee.toBigInt(),
        bridgeFeeWrapped: fee.toBigInt(),
        height,
        timestamp: new Date(block.timestamp),
    });
    issue.status = IssueStatus.Completed;
    await Promise.all([store.save(execution), store.save(issue)]);

    // TODO: call out to electrs and get payment info
}

export async function cancelIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id, _userParachainAddress, _griefingCollateral] =
        new IssueCrate.CancelIssueEvent(event).params;
    const issue = await store.get(Issue, { where: { id: id.toString() } });
    if (issue === undefined) {
        debug(
            "WARNING: CancelIssue event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight({ store }, block.height, "CancelIssue");
    const cancellation = new IssueCancellation({
        issue,
        height,
        timestamp: new Date(block.timestamp),
    });
    issue.status = IssueStatus.Cancelled;
    await Promise.all([store.save(cancellation), store.save(issue)]);
}

export async function requestRefund({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id, _issuer, amountPaid, _vault, btcAddress, issueId, btcFee] =
        new RefundCrate.RequestRefundEvent(event).params;
    const issue = await store.get(Issue, { where: { id: issueId.toString() } });
    if (issue === undefined) {
        debug(
            "WARNING: RequestRefund event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        { store },
        block.height,
        "RequestRefund"
    );
    const refund = new Refund({
        id: id.toString(),
        issue,
        issueID: issue.id,
        btcAddress: btcAddress.toString(),
        amountPaid: amountPaid.toBigInt(),
        btcFee: btcFee.toBigInt(),
        requestHeight: height,
        requestTimestamp: new Date(block.timestamp),
    });
    issue.status = IssueStatus.RequestedRefund;
    await Promise.all([store.save(refund), store.save(issue)]);
}

export async function executeRefund({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id] = new RefundCrate.ExecuteRefundEvent(event).params;
    const refund = await store.get(Refund, { where: { id: id.toString() } });
    if (refund === undefined) {
        debug(
            "WARNING: ExecuteRefund event did not match any existing refund requests! Skipping."
        );
        return;
    }
    const issue = await store.get(Issue, {
        where: { id: refund.issueID },
    });
    if (issue === undefined) {
        debug(
            "WARNING: ExecuteRefund event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        { store },
        block.height,
        "ExecuteRefund"
    );
    refund.executionHeight = height;
    refund.executionTimestamp = new Date(block.timestamp);
    issue.status = IssueStatus.Completed;
    await Promise.all([store.save(refund), store.save(issue)]);
}
