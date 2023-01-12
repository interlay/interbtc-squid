import * as ss58 from "@subsquid/ss58";
import { Network } from "bitcoinjs-lib";
import {
    Token,
    NativeToken,
    ForeignAsset,
    Currency,
    LendToken,
} from "../model";
import {
    VaultId as VaultIdV1020000,
    CurrencyId as CurrencyId_V1020000,
} from "../types/v1020000";
import {
    Address as AddressV15,
    CurrencyId_Token as CurrencyId_TokenV15,
    VaultId as VaultIdV15,
} from "../types/v15";
import {
    Address as AddressV6,
    CurrencyId_Token as CurrencyId_TokenV6,
    VaultId as VaultIdV6,
} from "../types/v6";
import { CurrencyId_Token as CurrencyId_TokenV10 } from "../types/v10";
import { encodeBtcAddress, getBtcNetwork } from "./bitcoinUtils";
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
import { CurrencyIdLiteral, WrappedAmount } from "@interlay/interbtc-api";

const bitcoinNetwork: Network = getBtcNetwork(process.env.BITCOIN_NETWORK);
const ss58format = process.env.SS58_CODEC || "substrate";

export const address = {
    interlay: ss58.codec(ss58format),
    btc: {
        encode(address: AddressV6 | AddressV15): string | undefined {
            return encodeBtcAddress(address, bitcoinNetwork);
        },
    },
};

export const legacyCurrencyId = {
    encode: (
        token: CurrencyId_TokenV6 | CurrencyId_TokenV10 | CurrencyId_TokenV15
    ): Currency => {
        // handle old type definition that had INTERBTC instead of IBTC
        if (token.value.__kind === "INTERBTC") {
            token = {
                ...token,
                value: {
                    __kind: "IBTC",
                },
            } as CurrencyId_TokenV15;
        }
        return new NativeToken({
            token: Token[(token as CurrencyId_TokenV15).value.__kind],
        });
    },
};

export const currencyId = {
    encode: (asset: CurrencyId_V1020000): Currency => {
        if (asset.__kind === "LendToken") {
            return new LendToken({
                lendTokenId: asset.value,
            });
        } else if (asset.__kind === "ForeignAsset") {
            // TODO: add asset-registry event decoding for more metadata?
            return new ForeignAsset({
                asset: asset.value,
            });
        } else {
            return new NativeToken({
                token: Token[asset.value.__kind],
            });
        }
    },
};

function currencyToString(currency: Currency): string {
    if (currency.isTypeOf === "LendToken") {
        // TODO: decide how we want to distinguish lend tokens from foreign assets
        return `lendToken_${currency.lendTokenId.toString()}`;
    } else if (currency.isTypeOf === "ForeignAsset") {
        return currency.asset.toString();
    } else {
        return currency.token.toString();
    }
}

export function encodeLegacyVaultId(vaultId: VaultIdV6 | VaultIdV15) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrapped = legacyCurrencyId.encode(vaultId.currencies.wrapped);
    const collateral = legacyCurrencyId.encode(vaultId.currencies.collateral);
    return `${addressStr}-${currencyToString(wrapped)}-${currencyToString(
        collateral
    )}`;
}

export function encodeVaultId(vaultId: VaultIdV1020000) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrapped = currencyId.encode(vaultId.currencies.wrapped);
    const collateral = currencyId.encode(vaultId.currencies.collateral);
    return `${addressStr}-${currencyToString(wrapped)}-${currencyToString(
        collateral
    )}`;
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
        return amount.valueOf() / (BigInt(10) ** currencyMap[currency.token].decimals);
    } else if (currency.isTypeOf === "ForeignAsset") {

    } else if (currency.isTypeOf === "LendToken") {

    } 
    
    throw new Error(`No handling implemented for currency type of ${currency.isTypeOf}`);
}
