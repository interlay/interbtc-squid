import { BlockHandlerContext } from "@subsquid/substrate-processor";
import { assert } from "console";
import { Height, IssuePeriod, RedeemPeriod } from "../../model";
import { IssueIssuePeriodStorage, RedeemRedeemPeriodStorage } from "../../types/storage";
import { blockToHeight } from "../_utils";

export async function setInitialPeriods(ctx: BlockHandlerContext): Promise<void> {
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
    );
    const timestamp = new Date(ctx.block.timestamp);

    await setInitialIssuePeriod(ctx, height, timestamp);
    await setInitialRedeemPeriod(ctx, height, timestamp);
}

async function setInitialIssuePeriod(ctx: BlockHandlerContext, height: Height, timestamp: Date) {
    const rawIssuePeriodStorage = new IssueIssuePeriodStorage(ctx);
    let value;
    if (rawIssuePeriodStorage.isV1) value = await rawIssuePeriodStorage.getAsV1();
    else throw Error("Unknown storage version");
    assert(rawIssuePeriodStorage.isExists, "Issue period does not exist");

    const issuePeriod = new IssuePeriod({
        id: `initial-${timestamp.toString()}`,
        height,
        timestamp,
        value
    })

    ctx.store.save(issuePeriod);
}

async function setInitialRedeemPeriod(ctx: BlockHandlerContext, height: Height, timestamp: Date) {
    const rawRedeemPeriodStorage = new RedeemRedeemPeriodStorage(ctx);
    let value;
    if (rawRedeemPeriodStorage.isV1) value = await rawRedeemPeriodStorage.getAsV1();
    else throw Error("Unknown storage version");
    assert(rawRedeemPeriodStorage.isExists, "Redeem period does not exist");

    const redeemPeriod = new RedeemPeriod({
        id: `initial-${timestamp.toString()}`,
        height,
        timestamp,
        value
    })

    ctx.store.save(redeemPeriod);
}