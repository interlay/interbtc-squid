import * as ss58 from "@subsquid/ss58";
import { Network } from "bitcoinjs-lib";
import {Token, NativeToken, ForeignAsset, Currency} from "../model";

import { CurrencyId as CurrencyId_V17, VaultId as VaultIdV17 } from "../types/v17";
import { Address as AddressV15, CurrencyId_Token as CurrencyId_TokenV15, VaultId as VaultIdV15 } from "../types/v15";
import { Address as AddressV6, CurrencyId_Token as CurrencyId_TokenV6, VaultId as VaultIdV6 } from "../types/v6";
import { encodeBtcAddress, getBtcNetwork } from "./bitcoinUtils";

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
    encode: (token: CurrencyId_TokenV6 | CurrencyId_TokenV15): Currency => {
        if (token.value.__kind === "INTERBTC") {
            token = {
                ...token,
                value: {
                    __kind: "INTR"
                }
            } as CurrencyId_TokenV15;
        }
        return new NativeToken({
            token: Token[(token as CurrencyId_TokenV15).value.__kind]
        });
    }
}

export const currencyId = {
    encode: (asset: CurrencyId_V17): Currency => {
        if (asset.__kind === "ForeignAsset") {
            return new ForeignAsset({
                asset: asset.value
            });
        } else {
            return new NativeToken({
                token: Token[asset.value.__kind]
            });
        }
    },
};

export function encodeLegacyVaultId(vaultId: VaultIdV6 | VaultIdV15) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrappedStr = legacyCurrencyId.encode(vaultId.currencies.wrapped).toString();
    const collateralStr = legacyCurrencyId.encode(vaultId.currencies.collateral).toString();
    return `${addressStr}-${wrappedStr}-${collateralStr}`;
}

export function encodeVaultId(vaultId: VaultIdV17) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrappedStr = currencyId.encode(vaultId.currencies.wrapped).toString();
    const collateralStr = currencyId.encode(vaultId.currencies.collateral).toString();
    return `${addressStr}-${wrappedStr}-${collateralStr}`;
}
