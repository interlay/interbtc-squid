import BN from "bn.js";
import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Issue as IssueCrate } from "../chain";
import {
    IssueExecution,
    Issue,
    IssueRequest,
    IssueStatus,
    Height,
} from "../generated/model";
import { blockToHeight } from "./_utils";
import { IssueCancellation } from "../generated/model";

export async function requestIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        userParachainAddress,
        requestedAmountWrapped,
        bridgeFee,
        griefingCollateral,
        vaultParachainAddress,
        vaultBackingAddress,
        vaultWalletPubkey,
    ] = new IssueCrate.RequestIssueEvent(event).params;
    const issue = new Issue({
        id: id.toString(),
        bridgeFee,
        griefingCollateral,
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
    const issueRequestData = new IssueRequest({
        issue, // TODO: double-check this works before saving
        requestedAmountWrapped,
        height,
        timestamp: new BN(block.timestamp),
    });

    await store.save(issue);
    await store.save(issueRequestData);
}

export async function executeIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        _userParachainAddress,
        executedAmountWrapped, // TODO: double-check
    ] = new IssueCrate.ExecuteIssueEvent(event).params;
    const issue = await store.get(Issue, { where: { id: id.toString() } });
    if (issue === undefined)
        throw new Error(
            "ExecuteIssue event did not match any existing issue requests"
        );
    const height = await blockToHeight({ store }, block.height, "ExecuteIssue");
    const execution = new IssueExecution({
        issue,
        executedAmountWrapped,
        height,
        timestamp: new BN(block.timestamp),
    });
    await store.save(execution);

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
    await store.save(cancellation);
}
