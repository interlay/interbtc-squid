import { ExtrinsicHandlerContext } from "@subsquid/substrate-processor/lib/interfaces/handlerContext";
import { Vault } from "../../model";
import { blockToHeight } from "../_utils";

export async function updateVaultActivity({
    store,
    extrinsic,
    block
}: ExtrinsicHandlerContext): Promise<void> {
    const vault = await store.get(Vault, { where: { id: extrinsic.signer } });
    if (vault === undefined) {
        console.info(
            `Extrinsic ${extrinsic.section}.${extrinsic.method} called by non-vault registered account ${extrinsic.signer}`
        );
        return;
    }
    vault.lastActivity = await blockToHeight(
        store,
        block.height,
        extrinsic.method
    );
    await store.save(vault);
}
