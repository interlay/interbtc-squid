import * as ss58 from "@subsquid/ss58";
import { Network } from "bitcoinjs-lib";
import { Token } from "../model";

import {
    Address as AddressV6,
    CurrencyId_Token as CurrencyId_TokenV6,
    VaultId as VaultIdV6,
} from "../types/v6";
import {
    CurrencyId_Token as CurrencyId_TokenV8,
    CurrencyId_ForeignAsset as CurrencyId_ForeignAssetV8,
    VaultId as VaultIdV8
} from "../types/v8";
import { encodeBtcAddress, getBtcNetwork } from "./bitcoinUtils";

const bitcoinNetwork: Network = getBtcNetwork(process.env.BITCOIN_NETWORK);
const ss58format = process.env.SS58_CODEC || "substrate";

export const address = {
    interlay: ss58.codec(ss58format),
    btc: {
        encode(address: AddressV6): string | undefined {
            return encodeBtcAddress(address, bitcoinNetwork);
        },
    },
};

export const currencyId = {
    token: {
        encode(token: CurrencyId_TokenV6 | CurrencyId_TokenV8 | CurrencyId_ForeignAssetV8) {
            const value = token.value;
            if (typeof value === "number") {
                // TODO: handle this before we add USDC!
                // Need to add type Currency = Token | Int to the graphql Schema
                // Then refactor the stuff taking Tokens right now to take Currencies
                throw new Error("Non-native currencies are not supported in Squid yet.");
                // return value;
            } else {
                return Token[value.__kind];
            }
        },
    },
};

export function encodeVaultId(vaultId: VaultIdV6 | VaultIdV8) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrappedStr = currencyId.token
        .encode(vaultId.currencies.wrapped)
        .toString();
    const collateralStr = currencyId.token
        .encode(vaultId.currencies.collateral)
        .toString();
    return `${addressStr}-${wrappedStr}-${collateralStr}`;
}
