import { EventHandlerContext } from "@subsquid/substrate-processor";
import { Vault } from "../../model";
import { VaultRegistryRegisterVaultEvent } from "../../types/events";
import { address } from "../_utils";

export async function registerVault(ctx: EventHandlerContext): Promise<void> {
    // const [id] = new VaultRegistry.RegisterVaultEvent(event).params;
    const e = new VaultRegistryRegisterVaultEvent(ctx).asLatest

    const vaultRegistration = new Vault({
        id: address.interlay.encode(e.vaultId.accountId),
        registrationBlock: ctx.block.height,
        registrationTimestamp: new Date(ctx.block.timestamp),
    });

    await ctx.store.save(vaultRegistration);
}
