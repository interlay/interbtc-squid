import { EventHandlerContext } from "@subsquid/substrate-processor";
import { OracleUpdate, OracleUpdateType } from "../../model";
import { OracleFeedValuesEvent } from "../../types/events";
import { address, currencyId } from "../encoding";
import { blockToHeight } from "../_utils";

export async function feedValues(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new OracleFeedValuesEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else e = rawEvent.asLatest;
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
            const typeString = currencyId.token.encode(key.value).toString();
            update.typeKey = typeString;
            keyToString += typeString;
        }
        update.id = `${oracleAddress}-${height.absolute.toString()}-${keyToString}`;
        await ctx.store.save(update);
    }
}
