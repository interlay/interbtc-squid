import { EventHandlerContext, toHex } from "@subsquid/substrate-processor";
import { Store } from "@subsquid/typeorm-store";
import Debug from "debug";
import { LessThanOrEqual } from "typeorm";
import {
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemPeriod,
    RedeemRequest,
    RedeemStatus,
    RelayedBlock,
    VolumeType,
} from "../../model";
import {
    RedeemCancelRedeemEvent,
    RedeemExecuteRedeemEvent,
    RedeemRedeemPeriodChangeEvent,
    RedeemRequestRedeemEvent,
} from "../../types/events";
import {
    address,
    currencyId,
    encodeLegacyVaultId,
    encodeVaultId,
    legacyCurrencyId,
} from "../encoding";
import {
    blockToHeight,
    eventArgs,
    getCurrentRedeemPeriod,
    getVaultId,
    getVaultIdLegacy,
    updateCumulativeVolumes,
} from "../_utils";

const debug = Debug("interbtc-mappings:redeem");

export async function requestRedeem(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new RedeemRequestRedeemEvent(ctx);
    let e;
    let vault;
    let vaultIdString;
    if (rawEvent.isV6 || rawEvent.isV15) {
        // legacy encodings
        if (rawEvent.isV6) e = rawEvent.asV6;
        else e = rawEvent.asV15;
        vault = await getVaultIdLegacy(ctx.store, e.vaultId);
        vaultIdString = encodeLegacyVaultId(e.vaultId);
    } else {
        if (!rawEvent.isV17)
            ctx.log.warn(`UNKOWN EVENT VERSION: Redeem.requestRedeem`);
        e = rawEvent.asV17;
        vault = await getVaultId(ctx.store, e.vaultId);
        vaultIdString = encodeVaultId(e.vaultId);
    }

    if (vault === undefined) {
        debug(
            `WARNING: no vault ID found for issue request ${toHex(
                e.redeemId
            )}, with encoded account-wrapped-collateral ID of ${vaultIdString} (at parachain absolute height ${
                ctx.block.height
            }`
        );
        return;
    }

    const period = await getCurrentRedeemPeriod(ctx.store, ctx.block.height);

    const redeem = new Redeem({
        id: toHex(e.redeemId),
        bridgeFee: e.fee,
        collateralPremium: e.premium,
        userParachainAddress: address.interlay.encode(e.redeemer),
        vault: vault,
        userBackingAddress: address.btc.encode(e.btcAddress),
        btcTransferFee: e.transferFee,
        status: RedeemStatus.Pending,
        period,
    });
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RequestIssue"
    );

    const backingBlock = await ctx.store.get(RelayedBlock, {
        order: { backingHeight: "DESC" },
        relations: { relayedAtHeight: true },
        where: {
            relayedAtHeight: {
                absolute: LessThanOrEqual(height.absolute),
            },
        },
    });

    if (backingBlock === undefined) {
        debug(
            `WARNING: no BTC blocks relayed before redeem request ${redeem.id} (at parachain absolute height ${height.absolute})`
        );
    }

    redeem.request = new RedeemRequest({
        requestedAmountBacking: e.amount,
        height: height.id,
        timestamp: new Date(ctx.block.timestamp),
        backingHeight: backingBlock?.backingHeight || 0,
    });

    await ctx.store.save(redeem);
}

export async function executeRedeem(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new RedeemExecuteRedeemEvent(ctx);
    let e;
    let collateralCurrency;
    let wrappedCurrency;
    if (rawEvent.isV6 || rawEvent.isV15) {
        if (rawEvent.isV6) e = rawEvent.asV6;
        else e = rawEvent.asV15;
        collateralCurrency = legacyCurrencyId.encode(
            e.vaultId.currencies.collateral
        );
        wrappedCurrency = legacyCurrencyId.encode(e.vaultId.currencies.wrapped);
    } else {
        if (!rawEvent.isV17)
            ctx.log.warn(`UNKOWN EVENT VERSION: Redeem.executeRedeem`);
        e = rawEvent.asV17;
        collateralCurrency = currencyId.encode(e.vaultId.currencies.collateral);
        wrappedCurrency = currencyId.encode(e.vaultId.currencies.wrapped);
    }

    const redeem = await ctx.store.get(Redeem, {
        where: { id: toHex(e.redeemId) },
    });
    if (redeem === undefined) {
        debug(
            "WARNING: ExecuteRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "ExecuteRedeem"
    );
    const execution = new RedeemExecution({
        id: redeem.id,
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
    });
    redeem.status = RedeemStatus.Completed;
    await ctx.store.save(execution);
    await ctx.store.save(redeem);

    await updateCumulativeVolumes(
        ctx.store,
        VolumeType.Redeemed,
        redeem.request.requestedAmountBacking,
        new Date(ctx.block.timestamp),
        collateralCurrency,
        wrappedCurrency
    );
}

export async function cancelRedeem(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new RedeemCancelRedeemEvent(ctx);
    let e;
    if (rawEvent.isV6) e = rawEvent.asV6;
    else if (rawEvent.isV15) e = rawEvent.asV15;
    else if (rawEvent.isV17) e = rawEvent.asV17;
    else {
        ctx.log.warn(`UNKOWN EVENT VERSION: Redeem.cancelRedeem`);
        e = rawEvent.asV17;
    }

    const redeem = await ctx.store.get(Redeem, {
        where: { id: toHex(e.redeemId) },
    });
    if (redeem === undefined) {
        debug(
            "WARNING: CancelRedeem event did not match any existing redeem requests! Skipping."
        );
        return;
    }
    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "CancelIssue"
    );
    const cancellation = new RedeemCancellation({
        id: redeem.id,
        redeem,
        height,
        timestamp: new Date(ctx.block.timestamp),
        slashedCollateral: e.slashedAmount,
        reimbursed: e.status.__kind === "Reimbursed",
    });
    redeem.status =
        e.status.__kind === "Reimbursed"
            ? RedeemStatus.Reimbursed
            : RedeemStatus.Retried;
    await ctx.store.save(cancellation);
    await ctx.store.save(redeem);
}

export async function redeemPeriodChange(
    ctx: EventHandlerContext<Store, eventArgs>
): Promise<void> {
    const rawEvent = new RedeemRedeemPeriodChangeEvent(ctx);
    let e;
    if (!rawEvent.isV16)
        ctx.log.warn(`UNKOWN EVENT VERSION: redeem.redeemPeriodChange`);
    e = rawEvent.asV16;

    const height = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RedeemPeriodChange"
    );

    const timestamp = new Date(ctx.block.timestamp);

    const redeemPeriod = new RedeemPeriod({
        id: `updated-${timestamp.toString()}`,
        height,
        timestamp,
        value: e.period,
    });

    await ctx.store.save(redeemPeriod);
}
