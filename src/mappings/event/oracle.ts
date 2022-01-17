import { EventHandlerContext } from "@subsquid/substrate-processor";
import { OracleFeedValuesEvent } from "../../types/events";
import { address } from "../_utils";

export async function feedValues(ctx: EventHandlerContext): Promise<void> {
    const e = new OracleFeedValuesEvent(ctx).asLatest
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(`ORACLE: ${address.interlay.encode(e.oracleId)}`)
}
