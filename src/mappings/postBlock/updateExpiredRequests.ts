import { BlockHandlerContext } from "@subsquid/substrate-processor";
import { debug } from "console";
import {
    Issue,
    IssuePeriod,
    IssueStatus,
    Redeem,
    RedeemPeriod,
    RedeemStatus,
    RelayedBlock,
} from "../../model";
import { blockToHeight, getCurrentIssuePeriod, getCurrentRedeemPeriod, isRequestExpired } from "../_utils";

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
        relations: ['period']
    });
    const pendingRedeems = await store.find(Redeem, {
        where: { status: RedeemStatus.Pending },
        relations: ['period']
    });

    const currentIssuePeriod = await getCurrentIssuePeriod(ctx.store);
    const currentRedeemPeriod = await getCurrentRedeemPeriod(ctx.store);
    if (currentIssuePeriod === undefined) {
        debug(`WARNING: Issue period is not set at block ${ctx.block.height}.`);
        return;
    }
    if(currentRedeemPeriod === undefined) {
        debug(`WARNING: Redeem period is not set at block ${ctx.block.height}.`);
        return;
    }

    const checkRequestExpiration = async (request: Issue | Redeem, latestPeriod: IssuePeriod | RedeemPeriod) => {
        const period = Math.max(latestPeriod.value, request.period.value);
        const isExpired = await isRequestExpired(
            store,
            request,
            latestBtcBlock,
            latestActiveBlock,
            period
        );
        if (isExpired) {
            request.status = "Expired" as IssueStatus | RedeemStatus;
            await store.save(request);
        }
    }

    for (const issueRequest of pendingIssues) {
        await checkRequestExpiration(issueRequest, currentIssuePeriod);
    }
    for (const redeemRequest of pendingRedeems) {
        await checkRequestExpiration(redeemRequest, currentRedeemPeriod);
    }
}
