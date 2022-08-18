import { EventHandlerContext } from "@subsquid/substrate-processor";
import {
    CumulativeVolumePerCurrencyPair,
    Vault,
    VolumeType,
} from "../../model";
import {
    VaultRegistryDecreaseLockedCollateralEvent,
    VaultRegistryIncreaseLockedCollateralEvent,
    VaultRegistryRegisterVaultEvent,
} from "../../types/events";
import {
    currencyId,
    address,
    encodeVaultId,
    encodeLegacyVaultId,
    legacyCurrencyId,
} from "../encoding";
import { blockToHeight } from "../_utils";

export async function registerVault(ctx: EventHandlerContext): Promise<void> {
    const rawEvent = new VaultRegistryRegisterVaultEvent(ctx);
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
        if (rawEvent.isV17) e = rawEvent.asV17;
        else e = rawEvent.asLatest;
        vaultId = encodeVaultId(e.vaultId);
        wrappedToken = currencyId.encode(e.vaultId.currencies.wrapped);
        collateralToken = currencyId.encode(e.vaultId.currencies.collateral);
    }

    const registrationBlock = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RegisterVault"
    );
    const vault = new Vault({
        id: vaultId,
        accountId: address.interlay.encode(e.vaultId.accountId),
        wrappedToken,
        collateralToken,
        registrationBlock: registrationBlock,
        registrationTimestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(vault);
}

export async function increaseLockedCollateral(
    ctx: EventHandlerContext
): Promise<void> {
    const rawEvent = new VaultRegistryIncreaseLockedCollateralEvent(ctx);
    let e;
    let wrappedToken;
    let collateralToken;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        wrappedToken = legacyCurrencyId.encode(e.currencyPair.wrapped);
        collateralToken = legacyCurrencyId.encode(e.currencyPair.collateral);
    } else {
        if (rawEvent.isV17) e = rawEvent.asV17;
        else e = rawEvent.asLatest;
        wrappedToken = currencyId.encode(e.currencyPair.wrapped);
        collateralToken = currencyId.encode(e.currencyPair.collateral);
    }

    const newVolume = new CumulativeVolumePerCurrencyPair({
        id: `Collateral-${ctx.block.timestamp.toString()}-${collateralToken.toString()}`,
        type: VolumeType.Collateral,
        amount: e.total,
        tillTimestamp: new Date(ctx.block.timestamp),
        collateralCurrency: collateralToken,
        wrappedCurrency: wrappedToken,
    });

    await ctx.store.save(newVolume);
}

export async function decreaseLockedCollateral(
    ctx: EventHandlerContext
): Promise<void> {
    const rawEvent = new VaultRegistryDecreaseLockedCollateralEvent(ctx);
    let e;
    let wrappedToken;
    let collateralToken;
    if (rawEvent.isV10 || rawEvent.isV15) {
        if (rawEvent.isV10) e = rawEvent.asV10;
        else e = rawEvent.asV15;
        wrappedToken = legacyCurrencyId.encode(e.currencyPair.wrapped);
        collateralToken = legacyCurrencyId.encode(e.currencyPair.collateral);
    } else {
        if (rawEvent.isV17) e = rawEvent.asV17;
        else e = rawEvent.asLatest;
        wrappedToken = currencyId.encode(e.currencyPair.wrapped);
        collateralToken = currencyId.encode(e.currencyPair.collateral);
    }

    const newVolume = new CumulativeVolumePerCurrencyPair({
        id: `Collateral-${ctx.block.timestamp.toString()}-${collateralToken.toString()}`,
        type: VolumeType.Collateral,
        amount: e.total,
        tillTimestamp: new Date(ctx.block.timestamp),
        collateralCurrency: collateralToken,
        wrappedCurrency: wrappedToken,
    });

    await ctx.store.save(newVolume);
}
