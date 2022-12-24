import { SubstrateBlock, toHex } from "@subsquid/substrate-processor";
import { LessThanOrEqual } from "typeorm";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemPeriod,
    RedeemRequest,
    RedeemStatus,
    RelayedBlock,
    VolumeType,
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    LoansNewMarketEvent,
} from "../../types/events";
import {
    address,
    currencyId,
    encodeLegacyVaultId,
    encodeVaultId,
    legacyCurrencyId,
} from "../encoding";
import {
    updateCumulativeVolumes,
    updateCumulativeVolumesForCurrencyPair,
} from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { getCurrentRedeemPeriod } from "../utils/requestPeriods";
import { getVaultId, getVaultIdLegacy } from "../_utils";

export async function newMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansNewMarketEvent(ctx, item.event);
    let e;
    let vault;
    let vaultIdString;
    // if (rawEvent.isV6 || rawEvent.isV15) {
    //     // legacy encodings
    //     if (rawEvent.isV6) e = rawEvent.asV6;
    //     else e = rawEvent.asV15;
    //     vault = await getVaultIdLegacy(ctx.store, e.vaultId);
    //     vaultIdString = encodeLegacyVaultId(e.vaultId);
    // } else {
    //     if (rawEvent.isV17) e = rawEvent.asV17;
    //     else if (rawEvent.isV1019000) e = rawEvent.asV1019000;
    //     else {
    //         e = rawEvent.asV1020000;
    //         if (!rawEvent.isV1020000)
    //             ctx.log.warn(`UNKOWN EVENT VERSION: Redeem.requestRedeem`);
    //     }
    //
    //     vault = await getVaultId(ctx.store, e.vaultId);
    //     vaultIdString = encodeVaultId(e.vaultId);
    // }
    //
    // if (vault === undefined) {
    //     ctx.log.warn(
    //         `WARNING: no vault ID found for issue request ${toHex(
    //             e.redeemId
    //         )}, with encoded account-wrapped-collateral ID of ${vaultIdString} (at parachain absolute height ${
    //             block.height
    //         }`
    //     );
    //     return;
    // }
    //
    // const period = await getCurrentRedeemPeriod(ctx, block);
    //
    // const redeem = new Redeem({
    //     id: toHex(e.redeemId),
    //     bridgeFee: e.fee,
    //     collateralPremium: e.premium,
    //     userParachainAddress: address.interlay.encode(e.redeemer),
    //     vault: vault,
    //     userBackingAddress: address.btc.encode(e.btcAddress),
    //     btcTransferFee: e.transferFee,
    //     status: RedeemStatus.Pending,
    //     period,
    // });
    // const height = await blockToHeight(ctx, block.height, "RequestIssue");
    //
    // const backingBlock = await ctx.store.get(RelayedBlock, {
    //     order: { backingHeight: "DESC" },
    //     relations: { relayedAtHeight: true },
    //     where: {
    //         relayedAtHeight: {
    //             absolute: LessThanOrEqual(height.absolute),
    //         },
    //     },
    // });
    //
    // if (backingBlock === undefined) {
    //     ctx.log.warn(
    //         `WARNING: no BTC blocks relayed before redeem request ${redeem.id} (at parachain absolute height ${height.absolute})`
    //     );
    // }
    //
    // redeem.request = new RedeemRequest({
    //     requestedAmountBacking: e.amount,
    //     height: height.id,
    //     timestamp: new Date(block.timestamp),
    //     backingHeight: backingBlock?.backingHeight || 0,
    // });
    //
    // await entityBuffer.pushEntity(Redeem.name, redeem);
}

