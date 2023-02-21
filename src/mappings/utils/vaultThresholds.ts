import { SubstrateBlock } from "@subsquid/substrate-processor";
import { Ctx } from "../../processor";
import { 
    VaultRegistryLiquidationVaultStorage,
    VaultRegistryPremiumRedeemThresholdStorage,
    VaultRegistrySecureCollateralThresholdStorage,
 } from "../../types/storage";
import { CurrencyId as CurrencyIdv1 } from "../../types/v1";
import { VaultCurrencyPair as VaultCurrencyPairv3 } from "../../types/v3";
import { VaultCurrencyPair as VaultCurrencyPairv6 } from "../../types/v6";
import { VaultCurrencyPair as VaultCurrencyPairv15 } from "../../types/v15";
import { VaultCurrencyPair as VaultCurrencyPairv17 } from "../../types/v17";
import { VaultCurrencyPair as VaultCurrencyPairv1020000 } from "../../types/v1020000";
import { VaultCurrencyPair as VaultCurrencyPairv1021000 } from "../../types/v1021000";
import { Currency } from "../../model";


// export function convertToVaultCurrencyPair(
//     collateral: Currency,
//     wrapped: Currency,
//     verison: string
// )
// {
//     const tokenCollateral = collateral.token();
//     if (verison === "V3"){
        
//     }
// }

export async function getLiquidationThreshold(
    ctx: Ctx,
    block: SubstrateBlock,
    key: CurrencyIdv1 | VaultCurrencyPairv3 | VaultCurrencyPairv6   | VaultCurrencyPairv15 
    | VaultCurrencyPairv17 | VaultCurrencyPairv1020000 | VaultCurrencyPairv1021000
)
{
    const rawLiquidationThreshold = new VaultRegistryLiquidationVaultStorage(ctx, block);
    let value;
    if (rawLiquidationThreshold.isV3)
        value = await rawLiquidationThreshold.getAsV3(key as VaultCurrencyPairv3);
    else if (rawLiquidationThreshold.isV6)
        value = await rawLiquidationThreshold.getAsV6(key as VaultCurrencyPairv6);
    else if (rawLiquidationThreshold.isV15)
        value = await rawLiquidationThreshold.getAsV15(key as VaultCurrencyPairv15);
    else if (rawLiquidationThreshold.isV17)
        value = await rawLiquidationThreshold.getAsV17(key as VaultCurrencyPairv17);
    else if (rawLiquidationThreshold.isV1020000)
        value = await rawLiquidationThreshold.getAsV1020000(key as VaultCurrencyPairv1020000);
    else if (rawLiquidationThreshold.isV1021000)
        value = await rawLiquidationThreshold.getAsV1021000(key as VaultCurrencyPairv1021000);
    else throw Error("Unknown storage verison")
    if (!rawLiquidationThreshold.isExists)
        throw new Error("Issue period does not exist");
    return value;
}

export async function getRegistryPremiumRedeemThreshold(
    ctx: Ctx,
    block: SubstrateBlock,
    key: CurrencyIdv1 | VaultCurrencyPairv3 | VaultCurrencyPairv6   | VaultCurrencyPairv15 
    | VaultCurrencyPairv17 | VaultCurrencyPairv1020000 | VaultCurrencyPairv1021000
)
{
    const rawPremiumRedeemThreshold = new VaultRegistryPremiumRedeemThresholdStorage(ctx, block);
    let value;
    if (rawPremiumRedeemThreshold.isV1)
        value = await rawPremiumRedeemThreshold.getAsV1(key as CurrencyIdv1);
    else if (rawPremiumRedeemThreshold.isV3)
        value = await rawPremiumRedeemThreshold.getAsV3(key as VaultCurrencyPairv3);
    else if (rawPremiumRedeemThreshold.isV6)
        value = await rawPremiumRedeemThreshold.getAsV6(key as VaultCurrencyPairv6);
    else if (rawPremiumRedeemThreshold.isV15)
        value = await rawPremiumRedeemThreshold.getAsV15(key as VaultCurrencyPairv15);
    else if (rawPremiumRedeemThreshold.isV17)
        value = await rawPremiumRedeemThreshold.getAsV17(key as VaultCurrencyPairv17);
    else if (rawPremiumRedeemThreshold.isV1020000)
        value = await rawPremiumRedeemThreshold.getAsV1020000(key as VaultCurrencyPairv1020000);
    else if (rawPremiumRedeemThreshold.isV1021000)
        value = await rawPremiumRedeemThreshold.getAsV1021000(key as VaultCurrencyPairv1021000);
    else throw Error("Unknown storage verison")
    if (!rawPremiumRedeemThreshold.isExists)
        throw new Error("Issue period does not exist");
    return value;
}

export async function getSecureCollateralThreshold(
    ctx: Ctx,
    block: SubstrateBlock,
    key: CurrencyIdv1 | VaultCurrencyPairv3 | VaultCurrencyPairv6 | VaultCurrencyPairv15 | VaultCurrencyPairv17 | VaultCurrencyPairv1020000 | VaultCurrencyPairv1021000
) {
    const rawSecureCollateralThreshold = new VaultRegistrySecureCollateralThresholdStorage(ctx, block);
    let value;
    if (rawSecureCollateralThreshold.isV1) {
        value = await rawSecureCollateralThreshold.getAsV1(key as CurrencyIdv1);
    } else if (rawSecureCollateralThreshold.isV3) {
        value = await rawSecureCollateralThreshold.getAsV3(key as VaultCurrencyPairv3);
    } else if (rawSecureCollateralThreshold.isV6) {
        value = await rawSecureCollateralThreshold.getAsV6(key as VaultCurrencyPairv6);
    } else if (rawSecureCollateralThreshold.isV15) {
        value = await rawSecureCollateralThreshold.getAsV15(key as VaultCurrencyPairv15);
    } else if (rawSecureCollateralThreshold.isV17) {
        value = await rawSecureCollateralThreshold.getAsV17(key as VaultCurrencyPairv17);
    } else if (rawSecureCollateralThreshold.isV1020000) {
        value = await rawSecureCollateralThreshold.getAsV1020000(key as VaultCurrencyPairv1020000);
    } else if (rawSecureCollateralThreshold.isV1021000) {
        value = await rawSecureCollateralThreshold.getAsV1021000(key as VaultCurrencyPairv1021000);
    } else {
        throw new Error("Unknown storage version");
    }
    if (!rawSecureCollateralThreshold.isExists) {
        throw new Error("Secure collateral threshold does not exist");
    }
    return value;
}