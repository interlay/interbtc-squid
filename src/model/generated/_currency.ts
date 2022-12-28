import {NativeToken} from "./_nativeToken"
import {ForeignAsset} from "./_foreignAsset"
import {LendToken} from "./_lendToken"

export type Currency = NativeToken | ForeignAsset | LendToken

export function fromJsonCurrency(json: any): Currency {
  switch(json?.isTypeOf) {
    case 'NativeToken': return new NativeToken(undefined, json)
    case 'ForeignAsset': return new ForeignAsset(undefined, json)
    case 'LendToken': return new LendToken(undefined, json)
    default: throw new TypeError('Unknown json object passed as Currency')
  }
}

export function currencySymbol(currency: Currency): String {
  switch(currency.isTypeOf) {
    case 'NativeToken': return currency.token
    case 'ForeignAsset': return `foreign ${ currency.asset.toString() }`
    case 'LendToken': return `lend ${ currency.lendTokenId.toString() }`
    default: throw new TypeError('Unknown object passed as Currency')
  }
}
