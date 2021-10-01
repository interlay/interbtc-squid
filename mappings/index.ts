import {
    EventContext,
    StoreContext,
} from "@subsquid/hydra-common";
import { Issue } from "../chain";
import { Issue as IssueEntity } from "../generated/model";

export async function requestIssue({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [
        id,
        userParachainAddress,
        wrappedAmount,
        bridgeFee,
        griefingCollateral,
        vaultParachainAddress,
        vaultBackingAddress,
        vaultWalletPubkey,
    ] = new Issue.RequestIssueEvent(event).params;
    const issue = new IssueEntity({
        id: id.toString(),
        userParachainAddress: userParachainAddress.toString(),
        wrappedAmount,
        bridgeFee,
        griefingCollateral,
        vaultParachainAddress: vaultParachainAddress.toString(),
        vaultBackingAddress: vaultBackingAddress.toString(),
        vaultWalletPubkey: vaultWalletPubkey.toString(),
        creationBlock: block.height,
        creationTimestamp: block.timestamp
    });

    await store.save(issue);
}
