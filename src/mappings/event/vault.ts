import { SubstrateBlock } from "@subsquid/substrate-processor";
import {
    CumulativeVolumePerCurrencyPair,
    Vault,
    VolumeType,
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    VaultRegistryDecreaseLockedCollateralEvent,
    VaultRegistryIncreaseLockedCollateralEvent,
    VaultRegistryRegisterVaultEvent,
} from "../../types/events";
import {
    address,
    currencyId,
    encodeLegacyVaultId,
    encodeVaultId,
    legacyCurrencyId,
} from "../encoding";
import { blockToHeight } from "../utils/heights";

export async function registerVault(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<Vault> {
    const rawEvent = new VaultRegistryRegisterVaultEvent(ctx, item.event);
    let e;
    let vaultId;
    let wrappedToken;
    let collateralToken;
    if (rawEvent.isV6 || rawEvent.isV15) {
        if (rawEvent.isV6) e = rawEvent.asV6;
        else e = rawEvent.asV15;
        vaultId = encodeLegacyVaultId(e.vaultId);
        wrappedToken = legacyCurrencyId.encode(e.vaultId.currencies.wrapped);
        collateralToken = legacyCurrencyId.encode(
            e.vaultId.currencies.collateral
        );
    } else {
        if (!rawEvent.isV17)
            ctx.log.warn(`UNKOWN EVENT VERSION: Vault.registerVault`);
        e = rawEvent.asV17;
        vaultId = encodeVaultId(e.vaultId);
        wrappedToken = currencyId.encode(e.vaultId.currencies.wrapped);
        collateralToken = currencyId.encode(e.vaultId.currencies.collateral);
    }

    const registrationBlock = await blockToHeight(
        ctx,
        block.height,
        "RegisterVault"
    );
    return new Vault({
        id: vaultId,
        accountId: address.interlay.encode(e.vaultId.accountId),
        wrappedToken,
        collateralToken,
        registrationBlock: registrationBlock,
        registrationTimestamp: new Date(block.timestamp),
    });
}

export async function increaseLockedCollateral(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<CumulativeVolumePerCurrencyPair> {
    const rawEvent = new VaultRegistryIncreaseLockedCollateralEvent(
        ctx,
        item.event
    );
    let e;
    let wrappedToken;
    let collateralToken;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        wrappedToken = legacyCurrencyId.encode(e.currencyPair.wrapped);
        collateralToken = legacyCurrencyId.encode(e.currencyPair.collateral);
    } else {
        if (!rawEvent.isV17)
            ctx.log.warn(
                `UNKOWN EVENT VERSION: Vault.increaseLockedCollateral`
            );
        e = rawEvent.asV17;
        wrappedToken = currencyId.encode(e.currencyPair.wrapped);
        collateralToken = currencyId.encode(e.currencyPair.collateral);
    }

    return new CumulativeVolumePerCurrencyPair({
        id: `Collateral-${item.event.id}`,
        type: VolumeType.Collateral,
        amount: e.total,
        tillTimestamp: new Date(block.timestamp),
        collateralCurrency: collateralToken,
        wrappedCurrency: wrappedToken,
    });
}

export async function decreaseLockedCollateral(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem
): Promise<CumulativeVolumePerCurrencyPair> {
    const rawEvent = new VaultRegistryDecreaseLockedCollateralEvent(
        ctx,
        item.event
    );
    let e;
    let wrappedToken;
    let collateralToken;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        wrappedToken = legacyCurrencyId.encode(e.currencyPair.wrapped);
        collateralToken = legacyCurrencyId.encode(e.currencyPair.collateral);
    } else {
        if (!rawEvent.isV17)
            ctx.log.warn(
                `UNKOWN EVENT VERSION: Vault.decreaseLockedCollateral`
            );
        e = rawEvent.asV17;
        wrappedToken = currencyId.encode(e.currencyPair.wrapped);
        collateralToken = currencyId.encode(e.currencyPair.collateral);
    }

    return new CumulativeVolumePerCurrencyPair({
        id: `Collateral-${item.event.id}`,
        type: VolumeType.Collateral,
        amount: e.total,
        tillTimestamp: new Date(block.timestamp),
        collateralCurrency: collateralToken,
        wrappedCurrency: wrappedToken,
    });
}
