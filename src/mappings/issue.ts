import { EventContext, StoreContext } from "@subsquid/hydra-common";
import BN from "bn.js";
import { Height, Issue, IssueCancellation, IssueExecution, IssueRequest, IssueStatus, Refund } from "../generated/model";
import { Issue as IssueCrate, Refund as RefundCrate } from "../types";
import { blockToHeight } from "./_utils";

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
        bridgeFee: bridgeFee.toBigInt(),
        griefingCollateral: griefingCollateral.toBigInt(),
        userParachainAddress: userParachainAddress.toString(),
        vaultParachainAddress: vaultParachainAddress.toString(),
        vaultBackingAddress: vaultBackingAddress.toString(),
        vaultWalletPubkey: vaultWalletPubkey.toString(),
    });
    const height = await store.get(Height, {
        where: { absolute: new BN(block.height) },
    });
    if (height === undefined)
        throw new Error(
            `Did not find Height entity for absolute block ${block.height}; this should never happen, unless the parachain has not produced a single active block yet!`
        );

    issue.request = new IssueRequest({
        amountWrapped: amountWrapped.toBigInt(),
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
    ] = new IssueCrate.ExecuteIssueEvent(event).params;
    const issue = await store.get(Issue, { where: { id: id.toString() } });
    if (issue === undefined)
        throw new Error(
            "ExecuteIssue event did not match any existing issue requests"
        );
    const height = await blockToHeight({ store }, block.height, "ExecuteIssue");
    const execution = new IssueExecution({
        issue,
        amountWrapped: amountWrapped.toBigInt(),
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
    if (issue === undefined)
        throw new Error(
            "CancelIssue event did not match any existing issue requests"
        );
    const height = await blockToHeight({ store }, block.height, "CancelIssue");
    const cancellation = new IssueCancellation({
        issue,
        height,
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
    if (issue === undefined)
        throw new Error(
            "RequestRefund event did not match any existing issue requests"
        );
    const height = await blockToHeight({store}, block.height, "RequestRefund");
    const refund = new Refund({
        id: id.toString(),
        issue,
        btcAddress: btcAddress.toString(),
        amountPaid: amountPaid.toBigInt(),
        btcFee: btcFee.toBigInt(),
        requestHeight: height,
        requestTimestamp: new Date(block.timestamp)
    });
    issue.status = IssueStatus.RequestedRefund;
    await Promise.all([store.save(refund), store.save(issue)]);
}

export async function executeRefund({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id] =
        new RefundCrate.ExecuteRefundEvent(event).params;
    const refund = await store.get(Refund, {where: {id: id.toString()}});
    if (refund === undefined)
        throw new Error(
            "ExecuteRefund event did not match any existing refund requests"
        );
    const issue = await store.get(Issue, {where: {id: refund.issue.id.toString()}});
    if (issue === undefined)
        throw new Error(
            "ExecuteRefund event did not match any existing issue requests"
        );
    const height = await blockToHeight({store}, block.height, "ExecuteRefund");
    refund.executionHeight = height;
    refund.executionTimestamp = new Date(block.timestamp);
    issue.status = IssueStatus.Completed;
    await Promise.all([store.save(refund), store.save(issue)]);
}
