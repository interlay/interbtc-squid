import {NativeToken} from "./_nativeToken"
import {ForeignAsset} from "./_foreignAsset"
import {LendToken} from "./_lendToken"
import {LpToken} from "./_lpToken"
import {StableLpToken} from "./_stableLpToken"
import { getForeignAsset } from "../../mappings/_utils";

export type Currency = NativeToken | ForeignAsset | LendToken | LpToken | StableLpToken

export function fromJsonCurrency(json: any): Currency {
    switch(json?.isTypeOf) {
        case 'NativeToken': return new NativeToken(undefined, json)
        case 'ForeignAsset': return new ForeignAsset(undefined, json)
        case 'LendToken': return new LendToken(undefined, json)
        case 'LpToken': return new LpToken(undefined, json)
        case 'StableLpToken': return new StableLpToken(undefined, json)
        default: throw new TypeError('Unknown json object passed as Currency')
    }
}

/*
export function currencySymbol(currency: Currency): String {
  switch(currency.isTypeOf) {
    case 'NativeToken': return currency.token
    case 'ForeignAsset': return `foreign ${ currency.asset.toString() }`
    case 'LendToken': return `lend ${ currency.lendTokenId.toString() }`
    default: throw new TypeError('Unknown object passed as Currency')
  }
}
*/

export async function friendlyAmount(currency: Currency, amount: number): Promise<string> {
  let amountFriendly: Number;
  switch(currency.isTypeOf) {
      case 'NativeToken':
          switch (currency.token) {
              case 'KINT':
              case 'KSM':
                  amountFriendly = amount / 10 ** 12;
                  return `${amountFriendly.toFixed(2)} ${currency.token}`;
              case 'INTR':
              case 'DOT':
                  amountFriendly = amount / 10 ** 10;
                  return `${amountFriendly.toFixed(2)} ${currency.token}`;
              case 'KBTC':
              case 'IBTC':
                  amountFriendly = amount / 10 ** 8;
                  return `${amountFriendly.toFixed(6)} ${currency.token}`;
              default:
                  return 'Unknown object passed as Currency'
          }
          break;
      case 'ForeignAsset':
          const details = await getForeignAsset(currency.asset)
          amountFriendly = amount / 10 ** (details.decimals);
          return `${amountFriendly.toFixed(2)} ${details.symbol}`;
      default:
          return `Unknown asset: ${currency}`
  }
}
