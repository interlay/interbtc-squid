import { SubstrateBlock, toHex } from "@subsquid/substrate-processor";
import { LessThanOrEqual } from "typeorm";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair,
    Issue,
    IssueCancellation,
    IssueExecution,
    IssuePeriod,
    IssueRequest,
    IssueStatus,
    RelayedBlock,
    VolumeType,
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    IssueCancelIssueEvent,
    IssueExecuteIssueEvent,
    IssueIssuePeriodChangeEvent,
    IssueRequestIssueEvent,
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
import { blockToHeight } from "../utils/heights";
import { getCurrentIssuePeriod } from "../utils/requestPeriods";
import { getVaultId, getVaultIdLegacy } from "../_utils";

export async function requestIssue(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Issue[]> {
    const rawEvent = new IssueRequestIssueEvent(ctx, item.event);
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
            ctx.log.warn(`UNKOWN EVENT VERSION: Issue.requestIssue`);
        e = rawEvent.asV17;
        vault = await getVaultId(ctx.store, e.vaultId);
        vaultIdString = encodeVaultId(e.vaultId);
    }

    if (vault === undefined) {
        ctx.log.warn(
            `WARNING: no vault ID found for issue request ${toHex(
                e.issueId
            )}, with encoded account-wrapped-collateral ID of ${vaultIdString} (at parachain absolute height ${
                block.height
            }`
        );
        return [];
    }

    const period = await getCurrentIssuePeriod(ctx, block);

    const issue = new Issue({
        id: toHex(e.issueId),
        griefingCollateral: e.griefingCollateral,
        userParachainAddress: address.interlay.encode(e.requester),
        vault: vault,
        vaultBackingAddress: address.btc.encode(e.vaultAddress),
        vaultWalletPubkey: toHex(e.vaultPublicKey),
        status: IssueStatus.Pending,
        period,
    });

    const height = await blockToHeight(ctx, block.height, "RequestIssue");

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
        ctx.log.warn(
            `WARNING: no BTC blocks relayed before issue request ${issue.id} (at parachain absolute height ${height.absolute})`
        );
    }

    issue.request = new IssueRequest({
        amountWrapped: e.amount,
        bridgeFeeWrapped: e.fee,
        height: height.id,
        timestamp: new Date(block.timestamp),
        backingHeight: backingBlock?.backingHeight || 0,
    });

    return [issue]; // use array return to provide simple handling of error states by returning []
}

async function _decodeExecuteIssue(ctx: Ctx, item: EventItem) {
    const rawEvent = new IssueExecuteIssueEvent(ctx, item.event);
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
            ctx.log.warn(`UNKOWN EVENT VERSION: Issue.executeIssue`);
        e = rawEvent.asV17;
        collateralCurrency = currencyId.encode(e.vaultId.currencies.collateral);
        wrappedCurrency = currencyId.encode(e.vaultId.currencies.wrapped);
    }
    const amountWrapped = e.amount - e.fee; // potentially clean up event on parachain side?

    const issue = await ctx.store.get(Issue, {
        where: { id: toHex(e.issueId) },
    });
    if (issue === undefined) {
        ctx.log.warn(
            "WARNING: ExecuteIssue event did not match any existing issue requests! Skipping."
        );
        return {};
    }
    return {
        issue,
        collateralCurrency,
        wrappedCurrency,
        amountWrapped,
        bridgeFeeWrapped: e.fee,
    };
}

export async function executeIssue(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Issue[]> {
    const { issue, amountWrapped, bridgeFeeWrapped } =
        await _decodeExecuteIssue(ctx, item);
    if (!issue) return [];
    const height = await blockToHeight(ctx, block.height, "ExecuteIssue");
    const execution = new IssueExecution({
        id: issue.id,
        issue,
        amountWrapped,
        bridgeFeeWrapped,
        height,
        timestamp: new Date(block.timestamp),
    });
    issue.status = IssueStatus.Completed;
    issue.execution = execution;

    return [issue];
}

export async function updateGlobalIssuedAmounts(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<CumulativeVolume[]> {
    const { amountWrapped } = await _decodeExecuteIssue(ctx, item);
    if (!amountWrapped) return [];
    return [
        await updateCumulativeVolumes(
            ctx.store,
            VolumeType.Issued,
            amountWrapped,
            new Date(block.timestamp),
            item
        ),
    ];
}

export async function updatePerCurrencyIssuedAmounts(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<CumulativeVolumePerCurrencyPair[]> {
    const { amountWrapped, collateralCurrency, wrappedCurrency } =
        await _decodeExecuteIssue(ctx, item);
    if (!amountWrapped || !collateralCurrency || !wrappedCurrency) return [];
    return [
        await updateCumulativeVolumesForCurrencyPair(
            ctx.store,
            VolumeType.Issued,
            amountWrapped,
            new Date(block.timestamp),
            item,
            collateralCurrency,
            wrappedCurrency
        ),
    ];
}

export async function cancelIssue(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Issue[]> {
    const rawEvent = new IssueCancelIssueEvent(ctx, item.event);
    let e;
    if (!rawEvent.isV4) ctx.log.warn(`UNKOWN EVENT VERSION: Issue.cancelIssue`);
    e = rawEvent.asV4;

    const issue = await ctx.store.get(Issue, {
        where: { id: toHex(e.issueId) },
    });
    if (issue === undefined) {
        ctx.log.warn(
            "WARNING: CancelIssue event did not match any existing issue requests! Skipping."
        );
        return [];
    }
    const height = await blockToHeight(ctx, block.height, "CancelIssue");
    const cancellation = new IssueCancellation({
        id: issue.id,
        issue,
        height,
        timestamp: new Date(block.timestamp),
    });
    issue.status = IssueStatus.Cancelled;
    issue.cancellation = cancellation;
    return [issue];
}

export async function issuePeriodChange(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<IssuePeriod> {
    const rawEvent = new IssueIssuePeriodChangeEvent(ctx, item.event);
    let e;
    if (!rawEvent.isV16)
        ctx.log.warn(`UNKOWN EVENT VERSION: Issue.issuePeriodChange`);
    e = rawEvent.asV16;

    const height = await blockToHeight(ctx, block.height, "IssuePeriodChange");

    return new IssuePeriod({
        id: item.event.id,
        height,
        timestamp: new Date(block.timestamp),
        value: e.period,
    });
}
