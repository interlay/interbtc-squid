import { BlockHandlerContext } from "@subsquid/substrate-processor";
import { findAndUpdateExpiredIssues } from "./updateExpiredRequests";

export async function postBlockHook(ctx: BlockHandlerContext): Promise<void> {
    await findAndUpdateExpiredIssues(ctx.store, ctx.block);
}
