// import { SubstrateBlock } from "@subsquid/substrate-processor";
// import { Ctx, EventItem } from "../../processor";
// import { TokensTotalIssuanceSetEvent } from "../../types/events";
// import { cumulativeSupply } from "../../model/resolvers/circulating-supply";
// import EntityBuffer from "../utils/entityBuffer";


// // setting issuance for native token INTR / KINT
// export async function handleTokensTotalIssuanceSetEvent(
//     ctx: Ctx,
//     block: SubstrateBlock,
//     item: EventItem,
//     entityBuffer: EntityBuffer
//     ): Promise<void> {
//     const rawEvent = new TokensTotalIssuanceSetEvent(ctx, item.event);
//     let amount: bigint;

//     if (rawEvent.isV17) {
//         ({ amount } = rawEvent.asV17);
//     } else if (rawEvent.isV1020000) {
//         ({ amount } = rawEvent.asV1020000);
//     } else if (rawEvent.isV1021000) {
//         ({ amount } = rawEvent.asV1021000);
//     } else {
//         ctx.log.warn(`UNKOWN EVENT VERSION: Tokens.TotalIssuanceSet`);
//         return;
//     }

//     // update the total supply and circulating supply accordingly
//     const totalSupplyDelta = amount - cumulativeSupply.totalSupply;
//     cumulativeSupply.totalSupply = amount;
//     cumulativeSupply.circulatingSupply += totalSupplyDelta;
// }


