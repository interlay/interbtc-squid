import { EventHandlerContext } from "@subsquid/substrate-processor";
import { OracleUpdate, OracleUpdateType } from "../../model";
import { OracleFeedValuesEvent } from "../../types/events";
import { address } from "../encoding";
import { blockToHeight } from "../_utils";

export async function feedValues(ctx: EventHandlerContext): Promise<void> {
    const e = new OracleFeedValuesEvent(ctx).asLatest;
    for (const [key, value] of e.values) {
        const height = await blockToHeight(
            ctx.store,
            ctx.block.height,
            "FeedValues"
        );
        const oracleAddress = address.interlay.encode(e.oracleId);
        const update = new OracleUpdate({
            height,
            timestamp: new Date(ctx.block.timestamp),
            oracleId: oracleAddress,
            type: OracleUpdateType[key.__kind],
            updateValue: value,
        });
        let keyToString = key.__kind.toString();
        if (key.__kind === "ExchangeRate") {
            update.typeKey = key.value.value.__kind;
            keyToString += key.value.value.__kind;
        }
        update.id = `${oracleAddress}-${height.absolute.toString()}-${keyToString}`;
        await ctx.store.save(update);
    }
}
