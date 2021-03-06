import * as ss58 from "@subsquid/ss58";
import { Network } from "bitcoinjs-lib";
import {Token} from "../model";

import { CurrencyId_Token as CurrencyId_TokenV17, CurrencyId_ForeignAsset as CurrencyId_ForeignAssetV17, VaultId as VaultIdV17 } from "../types/v17";
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

export const currencyId = {
    token: {
        encode(token: CurrencyId_TokenV6 | CurrencyId_TokenV15 | CurrencyId_TokenV17 | CurrencyId_ForeignAssetV17) {
            if (typeof token.value === "number") {
                // TODO: handle this before we add USDC!
                // Need to add type Currency = Token | Int to the graphql Schema
                // Then refactor the stuff taking Tokens right now to take Currencies
                throw new Error("Non-native currencies are not supported in Squid yet.");
                // return value;
            } else {
                if (token.value.__kind === "INTERBTC") {
                    token = {
                        ...token,
                        value: {
                            __kind: "INTR"
                        }
                    } as CurrencyId_TokenV15;
                }
                return Token[(token as CurrencyId_TokenV15).value.__kind];
            }
        },
    },
};

export function encodeVaultId(vaultId: VaultIdV6 | VaultIdV15 | VaultIdV17) {
    const addressStr = address.interlay.encode(vaultId.accountId).toString();
    const wrappedStr = currencyId.token.encode(vaultId.currencies.wrapped).toString();
    const collateralStr = currencyId.token.encode(vaultId.currencies.collateral).toString();
    return `${addressStr}-${wrappedStr}-${collateralStr}`;
}
