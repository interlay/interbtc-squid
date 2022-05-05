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
import { currencyId, address, encodeVaultId } from "../encoding";
import { blockToHeight } from "../_utils";

export async function registerVault(ctx: EventHandlerContext): Promise<void> {
    const e = new VaultRegistryRegisterVaultEvent(ctx).asLatest;

    const registrationBlock = await blockToHeight(
        ctx.store,
        ctx.block.height,
        "RegisterVault"
    );
    const vaultId = new Vault({
        id: encodeVaultId(e.vaultId),
        accountId: address.interlay.encode(e.vaultId.accountId),
        wrappedToken: currencyId.token.encode(e.vaultId.currencies.wrapped),
        collateralToken: currencyId.token.encode(
            e.vaultId.currencies.collateral
        ),
        registrationBlock: registrationBlock,
        registrationTimestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(vaultId);
}

export async function increaseLockedCollateral(
    ctx: EventHandlerContext
): Promise<void> {
    const e = new VaultRegistryIncreaseLockedCollateralEvent(ctx).asV15;
    const collateralToken = currencyId.token.encode(e.currencyPair.collateral);
    const wrappedToken = currencyId.token.encode(e.currencyPair.wrapped);

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
    const e = new VaultRegistryDecreaseLockedCollateralEvent(ctx).asV15;
    const collateralToken = currencyId.token.encode(e.currencyPair.collateral);
    const wrappedToken = currencyId.token.encode(e.currencyPair.wrapped);

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
