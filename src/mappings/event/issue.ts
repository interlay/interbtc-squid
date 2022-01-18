import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import Debug from "debug";
import { Issue, IssueCancellation, IssueExecution, IssueRequest, IssueStatus, Refund } from "../../model";
import {
    IssueCancelIssueEvent,
    IssueExecuteIssueEvent,
    IssueRequestIssueEvent,
    RefundExecuteRefundEvent,
    RefundRequestRefundEvent
} from "../../types/events";
import { address, blockToHeight } from "../_utils";

const debug = Debug("interbtc-mappings:issue");

export async function requestIssue(ctx: EventHandlerContext): Promise<void> {
    const e = new IssueRequestIssueEvent(ctx).asLatest;

    const issue = new Issue({
        id: toHex(e.issueId),
        griefingCollateral: e.griefingCollateral,
        userParachainAddress: address.interlay.encode(e.requester),
        vaultParachainAddress: address.interlay.encode(e.vaultId.accountId),
        vaultBackingAddress: address.btc.encode(e.vaultAddress),
        vaultWalletPubkey: toHex(e.vaultPublicKey),
        status: IssueStatus.Pending,
    });

    const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");

    issue.request = new IssueRequest({
        amountWrapped: e.amount,
        bridgeFeeWrapped: e.fee,
        height: height.id,
        timestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(issue);
}

export async function executeIssue(ctx: EventHandlerContext): Promise<void> {
    // const [
    //     id,
    //     _userParachainAddress,
    //     amountWrapped, // TODO: double-check
    //     _vaultParachainAddress,
    //     fee,
    // ] = new IssueCrate.ExecuteIssueEvent(event).params;
    const e = new IssueExecuteIssueEvent(ctx).asLatest
    const id = toHex(e.issueId)

    const issue = await ctx.store.get(Issue, { where: { id } });
    if (issue === undefined) {
        debug(
            "WARNING: ExecuteIssue event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "ExecuteIssue");
    const execution = new IssueExecution({
        issue,
        amountWrapped: e.amount - e.fee,
        bridgeFeeWrapped: e.fee,
        height,
        timestamp: new Date(ctx.block.timestamp),
    });
    issue.status = IssueStatus.Completed;
    await ctx.store.save(execution);
    await ctx.store.save(issue);

    // TODO: call out to electrs and get payment info
}

export async function cancelIssue(ctx: EventHandlerContext): Promise<void> {
    // const [id, _userParachainAddress, _griefingCollateral] =
    //     new IssueCrate.CancelIssueEvent(event).params;
    const e = new IssueCancelIssueEvent(ctx).asLatest
    const issue = await ctx.store.get(Issue, { where: { id: toHex(e.issueId) } });
    if (issue === undefined) {
        debug(
            "WARNING: CancelIssue event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "CancelIssue");
    const cancellation = new IssueCancellation({
        issue,
        height,
        timestamp: new Date(ctx.block.timestamp),
    });
    issue.status = IssueStatus.Cancelled;
    await ctx.store.save(cancellation)
    await ctx.store.save(issue)
}

export async function requestRefund(ctx: EventHandlerContext): Promise<void> {
    // const [id, _issuer, amountPaid, _vault, btcAddress, issueId, btcFee] =
    //     new RefundCrate.RequestRefundEvent(event).params;
    const e = new RefundRequestRefundEvent(ctx).asLatest
    const id = toHex(e.refundId)
    const issue = await ctx.store.get(Issue, { where: { id: toHex(e.issueId) } });
    if (issue === undefined) {
        debug(
            "WARNING: RequestRefund event did not match any existing issue requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RequestRefund"
    );
    const refund = new Refund({
        id,
        issue,
        issueID: issue.id,
        btcAddress: address.btc.encode(e.btcAddress),
        amountPaid: e.amount,
        btcFee: e.fee,
        requestHeight: height,
        requestTimestamp: new Date(ctx.block.timestamp),
    });
    issue.status = IssueStatus.RequestedRefund;
    await ctx.store.save(refund);
    await ctx.store.save(issue);
}

export async function executeRefund(ctx: EventHandlerContext): Promise<void> {
    // const [id] = new RefundCrate.ExecuteRefundEvent(event).params;
    const e = new RefundExecuteRefundEvent(ctx).asLatest
    const refund = await ctx.store.get(Refund, { where: { id: toHex(e.refundId) } });
    if (refund === undefined) {
        debug(
            "WARNING: ExecuteRefund event did not match any existing refund requests! Skipping."
        );
        return;
    }
    const issue = await ctx.store.get(Issue, {
        where: { id: refund.issueID },
    });
    if (issue === undefined) {
        debug(
            "WARNING: ExecuteRefund event did not match any existing issue requests! Skipping."
        );
        return;
    }
    refund.executionHeight = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "ExecuteRefund"
    );
    refund.executionTimestamp = new Date(ctx.block.timestamp);
    issue.status = IssueStatus.Completed;
    await ctx.store.save(refund);
    await ctx.store.save(issue);
}
