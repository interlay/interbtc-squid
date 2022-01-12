import {createTypeUnsafe, TypeRegistry} from '@polkadot/types'
import {Codec, DetectCodec} from '@polkadot/types/types'

export const typesJson = {
  "BalanceWrapper": {
    "currencyId": "CurrencyId",
    "amount": "i128"
  },
  "CurrencyId": {
    "_enum": {
      "Token": "TokenSymbol"
    }
  },
  "InterbtcPrimitivesCurrencyId": {
    "_enum": {
      "Token": "InterbtcPrimitivesTokenSymbol"
    }
  },
  "FundAccountJsonRpcRequest": {
    "account_id": "AccountId",
    "currency_id": "InterbtcPrimitivesCurrencyId"
  },
  "H256Le": "H256",
  "SignedFixedPoint": "FixedU128",
  "TokenSymbol": {
    "_enum": {
      "DOT": 0,
      "INTERBTC": 1,
      "INTR": 2,
      "KSM": 10,
      "KBTC": 11,
      "KINT": 12
    }
  },
  "InterbtcPrimitivesTokenSymbol": {
    "_enum": {
      "DOT": 0,
      "INTERBTC": 1,
      "INTR": 2,
      "KSM": 10,
      "KBTC": 11,
      "KINT": 12
    }
  },
  "UnsignedFixedPoint": "FixedU128",
  "VaultCurrencyPair": {
    "collateral": "CurrencyId",
    "wrapped": "CurrencyId"
  },
  "VaultId": {
    "account_id": "AccountId",
    "currencies": "VaultCurrencyPair"
  }
}

export const registry = new TypeRegistry()
registry.register(typesJson)

export function create<T extends Codec = Codec, K extends string = string>(type: K, params: unknown): DetectCodec<T, K> {
  return createTypeUnsafe(registry, type, [params])
}
