import { BlockContext, StoreContext } from "@subsquid/hydra-common";
import { Issue, IssueStatus, RelayedBlock } from "../../generated/model";
import { blockToHeight, isIssueExpired } from "./../_utils";

export const findAndUpdateExpiredIssues = async ({
    store,
    block,
}: StoreContext & BlockContext) => {
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
        latestActiveBlock = (await blockToHeight({ store }, block.height))
            .active;
    } catch (e) {
        return; // likely first few blocks, before any active blocks were generated yet
    }

    const pendingIssues = await store.getMany(Issue, {
        where: {
            status: IssueStatus.Pending,
        },
    });
    const expiredIssues = (
        await Promise.all(
            pendingIssues.map(async (issue) => {
                if (
                    await isIssueExpired(
                        { store },
                        issue,
                        latestBtcBlock,
                        latestActiveBlock
                    )
                ) {
                    issue.status = IssueStatus.Expired;
                }
                return issue;
            })
        )
    ).filter((issue) => issue.status === IssueStatus.Expired);

    await Promise.all(expiredIssues.map((issue) => store.save(issue)));
};
