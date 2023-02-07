import { Store } from "@subsquid/typeorm-store";
import { CumulativeVolumePerCurrencyPair, Vault } from "../../model";
import EntityBuffer from "./entityBuffer";

export enum updateType {
    collateralAmount = "collateralAmount",
    pendingWrappedAmount = "pendingWrappedAmount",
}

export async function  updateVault(vaultID: string, amount: bigint, entityBuffer: EntityBuffer, store: Store, updateTypeValue: updateType): Promise<Vault> {
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
    
    if (updateTypeValue === updateType.collateralAmount) {
        existingVault.collateralAmount = amount;
    }
    else if (updateTypeValue === updateType.pendingWrappedAmount) {
        existingVault.pendingWrappedAmount += amount;
    }
    
    return existingVault;
}