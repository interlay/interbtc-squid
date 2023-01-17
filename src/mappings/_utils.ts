import { Entity, Store } from "@subsquid/typeorm-store";
import { Height, Issue, Redeem, Vault } from "../model";
import { VaultId as VaultIdV15 } from "../types/v15";
import { VaultId as VaultIdV17 } from "../types/v17";
import { VaultId as VaultIdV6 } from "../types/v6";
import { VaultId as VaultIdV1020000 } from "../types/v1020000";
import { encodeLegacyVaultId, encodeVaultId } from "./encoding";
import {
    Token,
    NativeToken,
    ForeignAsset,
    Currency,
    LendToken,
} from "../model";
import {
    Bitcoin,
    Currency as tCurrency,
    InterBtc,
    Interlay,
    KBtc,
    Kintsugi,
    Kusama,
    Polkadot
} from "@interlay/monetary-js";
import {WrappedAmount  } from "@interlay/interbtc-api";

export type eventArgs = {
    event: { args: true };
};
export type eventArgsData = {
    data: eventArgs;
};

const parachainBlocksPerBitcoinBlock = 100; // TODO: HARDCODED - find better way to set?

export async function getVaultIdLegacy(
    store: Store,
    vaultId: VaultIdV15 | VaultIdV6
) {
    return store.get(Vault, {
        where: { id: encodeLegacyVaultId(vaultId) },
    });
}

export async function getVaultId(store: Store, vaultId: VaultIdV1020000) {
    return store.get(Vault, {
        where: { id: encodeVaultId(vaultId) },
    });
}

export async function isRequestExpired(
    store: Store,
    request: Issue | Redeem,
    latestBtcBlock: number,
    latestActiveBlock: number,
    period: number
): Promise<boolean> {
    const requestHeight = await store.get(Height, {
        where: { id: request.request.height },
    });
    if (requestHeight === undefined) return false; // no active blocks yet

    const btcPeriod = Math.ceil(period / parachainBlocksPerBitcoinBlock);

    return (
        request.request.backingHeight + btcPeriod < latestBtcBlock &&
        requestHeight.active + period < latestActiveBlock
    );
}

const currencyMap = {
    [Token.DOT]: Polkadot,
    [Token.INTR]: InterBtc,
    [Token.KSM]: Kusama,
    [Token.KINT]: Kintsugi,
    [Token.IBTC]: InterBtc,
    [Token.KBTC]: KBtc
}
export function convertAmountToHuman(currency: Currency, amount: BigInt ) : BigInt {
    if (currency.isTypeOf === "NativeToken") {
        return amount.valueOf() / (BigInt(10) ** BigInt(currencyMap[currency.token].decimals));
    } else if (currency.isTypeOf === "ForeignAsset") {
        // currency = await InterBtc.assetRegistry.getForeignAsset((exchangeCurrency as ForeignAsset).asset);
    } else if (currency.isTypeOf === "LendToken") {
        // lend tokens not implemented on chain yet
    } 
    
    throw new Error(`No handling implemented for currency type of ${currency.isTypeOf}`);
}
