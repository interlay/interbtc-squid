import * as ss58 from "@subsquid/ss58";
import { EventHandlerContext } from "@subsquid/substrate-processor";
import { OracleFeedValuesEvent } from "../../types/events";

export async function feedValues(ctx: EventHandlerContext): Promise<void> {
    const e = new OracleFeedValuesEvent(ctx).asLatest
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(`ORACLE: ${ss58.codec('interlay').encode(e.oracleId)}`)
}
