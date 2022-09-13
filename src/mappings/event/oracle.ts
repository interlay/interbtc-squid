import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import { OracleUpdate, OracleUpdateType } from "../../model";
import { OracleFeedValuesEvent } from "../../types/events";
import { CurrencyId as CurrencyId_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { address, currencyId, legacyCurrencyId } from "../encoding";
import { blockToHeight, eventArgs } from "../_utils";

export async function feedValues(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new OracleFeedValuesEvent(ctx);
    let e;
    let useLegacyCurrency = false;
    if (rawEvent.isV6 || rawEvent.isV15) {
        useLegacyCurrency = true;
    }
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else {
        if (!rawEvent.isV17)
            ctx.log.warn(`UNKOWN EVENT VERSION: Oracle.feedValues`);
        e = rawEvent.asV17;
    }
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
            const exchangeCurrency = useLegacyCurrency
                ? legacyCurrencyId.encode(key.value as CurrencyId_V15)
                : currencyId.encode(key.value as CurrencyId_V17);
            update.typeKey = exchangeCurrency;
            keyToString += JSON.stringify(exchangeCurrency);
        }
        update.id = `${oracleAddress}-${height.absolute.toString()}-${keyToString}`;
        await ctx.store.save(update);
    }
}
