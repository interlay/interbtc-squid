import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Vault } from "../../model";
import { VaultRegistryRegisterVaultEvent } from "../../types/events";
import { currencyId, address, encodeVaultId } from "../encoding";
import { blockToHeight } from "../_utils";

export async function registerVault(ctx: EventHandlerContext): Promise<void> {
    // const [id] = new VaultRegistry.RegisterVaultEvent(event).params;
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
