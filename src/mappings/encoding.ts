import * as ss58 from "@subsquid/ss58";
import { Network } from "bitcoinjs-lib";
import {
    Token,
    NativeToken,
    ForeignAsset,
    Currency,
    LendToken,
    RateModelJump,
    RateModelCurve,
    RateModel,
} from "../model";
import {
    VaultId as VaultIdV1020000,
    CurrencyId as CurrencyId_V1020000,
    InterestRateModel as InterestRateModel_V1020000,
    MarketState as MarketState_V1020000,
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

export const rateModel = {
    encode: (model: InterestRateModel_V1020000): RateModel => {
        if (model.__kind === "Jump") {
            return new RateModelJump({
                baseRate: model.value.baseRate,
                jumpRate: model.value.jumpRate,
                fullRate: model.value.fullRate,
                jumpUtilization: model.value.jumpUtilization,
            });
        } else {
            return new RateModelCurve({
                baseRate: model.value.baseRate,
            });
        }
    },
};

export function currencyToString(currency: Currency): string {
    if (currency.isTypeOf === "LendToken") {
        // TODO: decide how we want to distinguish lend tokens from foreign assets
        return `lendToken_${currency.lendTokenId.toString()}`;
    } else if (currency.isTypeOf === "ForeignAsset") {
        return `foreignAsset_${currency.asset.toString()}`;
    } else {
        return `nativeToken_${currency.token.toString()}`;
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
