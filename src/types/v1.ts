
export interface H256Le {
  content: Uint8Array
}

export type AccountId32 = Uint8Array

export type H256 = Uint8Array

export interface VaultId {
  accountId: AccountId32
  currencies: VaultCurrencyPair
}

export type Address = Address_P2PKH | Address_P2SH | Address_P2WPKHv0 | Address_P2WSHv0

export interface Address_P2PKH {
  __kind: 'P2PKH'
  value: H160
}

export interface Address_P2SH {
  __kind: 'P2SH'
  value: H160
}

export interface Address_P2WPKHv0 {
  __kind: 'P2WPKHv0'
  value: H160
}

export interface Address_P2WSHv0 {
  __kind: 'P2WSHv0'
  value: H256
}

export type PublicKey = Uint8Array

export type Key = Key_ExchangeRate | Key_FeeEstimation

export interface Key_ExchangeRate {
  __kind: 'ExchangeRate'
  value: CurrencyId
}

export interface Key_FeeEstimation {
  __kind: 'FeeEstimation'
}

export type FixedU128 = bigint

export type RedeemRequestStatus = RedeemRequestStatus_Pending | RedeemRequestStatus_Completed | RedeemRequestStatus_Reimbursed | RedeemRequestStatus_Retried

export interface RedeemRequestStatus_Pending {
  __kind: 'Pending'
}

export interface RedeemRequestStatus_Completed {
  __kind: 'Completed'
}

export interface RedeemRequestStatus_Reimbursed {
  __kind: 'Reimbursed'
  value: boolean
}

export interface RedeemRequestStatus_Retried {
  __kind: 'Retried'
}

export interface VaultCurrencyPair {
  collateral: CurrencyId
  wrapped: CurrencyId
}

export type H160 = Uint8Array

export type CurrencyId = CurrencyId_Token

export interface CurrencyId_Token {
  __kind: 'Token'
  value: TokenSymbol
}

export type TokenSymbol = TokenSymbol_DOT | TokenSymbol_INTERBTC | TokenSymbol_INTR | TokenSymbol_KSM | TokenSymbol_KBTC | TokenSymbol_KINT

export interface TokenSymbol_DOT {
  __kind: 'DOT'
}

export interface TokenSymbol_INTERBTC {
  __kind: 'INTERBTC'
}

export interface TokenSymbol_INTR {
  __kind: 'INTR'
}

export interface TokenSymbol_KSM {
  __kind: 'KSM'
}

export interface TokenSymbol_KBTC {
  __kind: 'KBTC'
}

export interface TokenSymbol_KINT {
  __kind: 'KINT'
}
