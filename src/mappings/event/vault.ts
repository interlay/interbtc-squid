import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { VaultRegistry } from "../../types";
import { Vault } from "../../generated/model";

export async function registerVault({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const [id] = new VaultRegistry.RegisterVaultEvent(event).params;
    const vaultRegistration = new Vault({
        id: id.toString(),
        registrationBlock: block.height,
        registrationTimestamp: new Date(block.timestamp),
    });

    await store.save(vaultRegistration);
}
