import BN from "bn.js";
import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { Issue as IssueCrate } from "../chain";
import { Execution, Issue, IssueRequest, IssueStatus } from "../generated/model";

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
        status: IssueStatus.PendingWithBtcTxNotFound,
    });
    const issueRequestData = new IssueRequest({
        issue, // TODO: double-check this works before saving
        requestedAmountWrapped,
        block: block.height,
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
    const issue = await store.get(Issue, { where: { id } });
    if (issue === undefined)
        throw new Error(
            "ExecuteIssue event did not match any existing issue requests"
        );
    const execution = new Execution({
        issue,
        executedAmountWrapped,
        block: block.height,
        timestamp: new BN(block.timestamp),
    });
    await store.save(execution);

    // TODO: call out to electrs and get payment info
    // TODO: handle potential refunds?
}
