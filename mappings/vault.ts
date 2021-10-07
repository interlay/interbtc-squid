import BN from "bn.js";
import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { VaultRegistry } from "../chain";
import { VaultRegistration } from "../generated/model";

export async function registerVault({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id] = new VaultRegistry.RegisterVaultEvent(event).params;
    const vaultRegistration = new VaultRegistration({
        id: id.toString(),
        block: block.height,
        timestamp: new BN(block.timestamp),
    });

    await store.save(vaultRegistration);
}
