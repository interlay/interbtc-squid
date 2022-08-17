import {NativeToken} from "./_nativeToken"
import {ForeignAsset} from "./_foreignAsset"

export type Currency = NativeToken | ForeignAsset

export function fromJsonCurrency(json: any): Currency {
  switch(json?.isTypeOf) {
    case 'NativeToken': return new NativeToken(undefined, json)
    case 'ForeignAsset': return new ForeignAsset(undefined, json)
    default: throw new TypeError('Unknown json object passed as Currency')
  }
}
