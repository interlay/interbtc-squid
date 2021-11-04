import { BlockContext, StoreContext } from "@subsquid/hydra-common";
import { findAndUpdateExpiredIssues } from "./updateExpiredRequests";

export async function postBlockHook({
    store,
    block,
}: StoreContext & BlockContext): Promise<void> {
    await findAndUpdateExpiredIssues({ store, block });
}
