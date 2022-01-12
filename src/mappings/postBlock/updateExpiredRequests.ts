import { Store, SubstrateBlock } from "@subsquid/substrate-processor";
import { Issue, IssueStatus, RelayedBlock } from "../../model";
import { blockToHeight, isIssueExpired } from "../_utils";

export async function findAndUpdateExpiredIssues(
    store: Store,
    block: SubstrateBlock
): Promise<void> {
    const latestBtcBlock = (
        await store.get(RelayedBlock, {
            order: {
                backingHeight: "DESC",
            },
        })
    )?.backingHeight;
    if (!latestBtcBlock) return; // no relayed blocks yet, can't determine whether anything is expired

    let latestActiveBlock: number;
    try {
        latestActiveBlock = (await blockToHeight(store, block.height))
            .active;
    } catch (e) {
        return; // likely first few blocks, before any active blocks were generated yet
    }

    const pendingIssues = await store.find(Issue, {
        where: {
            status: IssueStatus.Pending,
        },
    });

    for (const issue of pendingIssues) {
        if (
            await isIssueExpired(
                store,
                issue,
                latestBtcBlock,
                latestActiveBlock
            )
        ) {
            issue.status = IssueStatus.Expired;
            await store.save(issue);
        }
    }
};
