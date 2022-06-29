import { BlockHandlerContext } from "@subsquid/substrate-processor";
import { assert } from "console";
import { IssueIssuePeriodStorage } from "../../types/storage";

export async function setInitialIssuePeriod(ctx: BlockHandlerContext): Promise<void> {
    const rawStorage = new IssueIssuePeriodStorage(ctx);
    let issuePeriod;
    if (rawStorage.isV1) issuePeriod = rawStorage.getAsV1();
    else throw Error("Unknown storage version");

    assert(rawStorage.isExists, "Issue period does not exist");
    // TODO: Save to store.
}