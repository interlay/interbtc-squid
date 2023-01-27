import { Store } from "@subsquid/typeorm-store";
import { CumulativeVolumePerCurrencyPair, Vault } from "../../model";
import EntityBuffer from "./entityBuffer";


export async function  updateVaultLockedCollateral(vaultID: string, amount: bigint, entityBuffer: EntityBuffer, store: Store): Promise<Vault> {
    // find by vaultid if it exists in either entity buffer or database
    const existingVault =
    (entityBuffer.getBufferedEntityBy(
        Vault.name,
        vaultID,
    ) as Vault) ||
    (await store.get(Vault, vaultID));

    if (existingVault === undefined) {
        console.error(`couldn't find vault to update vault ID: ${vaultID}`);
    }
    existingVault.collateralAmount += amount;
    return existingVault;
}