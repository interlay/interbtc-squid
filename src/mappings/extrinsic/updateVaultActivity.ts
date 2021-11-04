import { ExtrinsicContext, StoreContext } from "@subsquid/hydra-common";
import { Vault } from "../../generated/model";
import { blockToHeight } from "../_utils";

export async function updateVaultActivity({
    store,
    event: _event,
    extrinsic,
    block,
}: StoreContext & ExtrinsicContext): Promise<void> {
    const vault = await store.get(Vault, { where: { id: extrinsic.signer } });
    if (vault === undefined) {
        console.info(
            `Extrinsic ${extrinsic.section}.${extrinsic.method} called by non-vault registered account ${extrinsic.signer}`
        );
        return;
    }
    const height = await blockToHeight(
        { store },
        block.height,
        extrinsic.method
    );
    vault.lastActivity = height;
    await store.save(vault);
}
