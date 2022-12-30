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

export function friendlyAmount(currency: Currency,
                               amount: bigint,
                               // store: Store,
                               // entityBuffer: EntityBuffer
): String {
  let amountFriendly: Number;
  switch(currency.isTypeOf) {
      case 'NativeToken':
        switch(currency.token){
            case 'KINT':
            case 'KSM':
                amountFriendly = Number((amount) / 1_000_000_000_000n);
                return `${amountFriendly.toFixed(2)} ${currency.token}`;
            case 'INTR':
            case 'DOT':
                amountFriendly = Number((amount) / 10_000_000_000n);
                return `${amountFriendly.toFixed(2)} ${currency.token}`;
            case 'KBTC':
            case 'IBTC':
                amountFriendly = Number(amount) / 10**8;
                return `${amountFriendly.toFixed(6)} ${currency.token}`;
            default: throw new TypeError('Unknown object passed as Currency')

        }
        break;
      case 'ForeignAsset':
        switch (currency.asset) {
            case 1:
                // TODO: look this up in the registry
                amountFriendly = Number((amount) / 1_000_000n);
                return `${amountFriendly.toFixed(2)} USDT`;
            default:
                throw new TypeError('Unknown foreign asset passed as Currency')
        }
        break;
    case 'LendToken':
        const id = `${currency.lendTokenId.toString()}`;
        switch (currency.lendTokenId) {
            case 0:
                // TODO: look this up in the registry
                amountFriendly = Number((amount) / 1_000_000_000_000n) * .02;
                return `${amountFriendly.toFixed(2)} KSM`;
            case 1:
                // TODO: look this up in the registry
                amountFriendly = Number(amount) / 10**8 * .02;
                return `${amountFriendly.toFixed(6)} KBTC`;
            case 2:
                // TODO: look this up in the registry
                amountFriendly = Number((amount) / 1_000_000_000_000n) * .02;
                return `${amountFriendly.toFixed(2)} KINT`;
            case 4:
                // TODO: look this up in the registry
                amountFriendly = Number((amount) / 1_000_000n) * .02;
                return `${amountFriendly.toFixed(2)} USDT`;
            default:
                throw new TypeError('Unknown lend token passed as Currency')
        }
        break;
    default: throw new TypeError('Unknown object passed as Currency')
  }
}
