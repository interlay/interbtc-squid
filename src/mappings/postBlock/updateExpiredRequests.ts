import { BlockHandlerContext } from "@subsquid/substrate-processor";
import {
    Issue,
    IssueStatus,
    Redeem,
    RedeemStatus,
    RelayedBlock,
} from "../../model";
import { blockToHeight, isRequestExpired } from "../_utils";

const MIN_DELAY = 5000; // ms
let lastTimestamp = 0;

export async function findAndUpdateExpiredRequests(
    ctx: BlockHandlerContext
): Promise<void> {
    const now = Date.now();
    if (now < lastTimestamp + MIN_DELAY) {
        return; // only run it at most once ever MIN_DELAY ms
    }
    lastTimestamp = now;
    const store = ctx.store;
    const block = ctx.block;

    const latestBtcBlock = (
        await store.get(RelayedBlock, {
            order: { backingHeight: "DESC" },
        })
    )?.backingHeight;
    if (!latestBtcBlock) return; // no relayed blocks yet, can't determine whether anything is expired

    let latestActiveBlock: number;
    try {
        latestActiveBlock = (await blockToHeight(store, block.height)).active;
    } catch (e) {
        return; // likely first few blocks, before any active blocks were generated yet
    }

    const pendingIssues = await store.find(Issue, {
        where: { status: IssueStatus.Pending },
    });
    const pendingRedeems = await store.find(Redeem, {
        where: { status: RedeemStatus.Pending },
    });
    const pendingRequests = (pendingIssues as Array<Issue | Redeem>).concat(
        pendingRedeems
    );

    for (const request of pendingRequests) {
        const isExpired = await isRequestExpired(
            store,
            request,
            latestBtcBlock,
            latestActiveBlock
        );
        if (isExpired) {
            request.status = "Expired" as IssueStatus | RedeemStatus;
            await store.save(request);
        }
    }
}
