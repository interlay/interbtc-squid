import type {Result, Option} from './support'

export type CurrencyId = CurrencyId_Token | CurrencyId_ForeignAsset | CurrencyId_LendToken | CurrencyId_LpToken | CurrencyId_StableLpToken

export interface CurrencyId_Token {
    __kind: 'Token'
    value: TokenSymbol
}

export interface CurrencyId_ForeignAsset {
    __kind: 'ForeignAsset'
    value: number
}

export interface CurrencyId_LendToken {
    __kind: 'LendToken'
    value: number
}

export interface CurrencyId_LpToken {
    __kind: 'LpToken'
    value: [LpToken, LpToken]
}

export interface CurrencyId_StableLpToken {
    __kind: 'StableLpToken'
    value: number
}

export interface VaultId {
    accountId: Uint8Array
    currencies: VaultCurrencyPair
}

export type Address = Address_P2PKH | Address_P2SH | Address_P2WPKHv0 | Address_P2WSHv0

export interface Address_P2PKH {
    __kind: 'P2PKH'
    value: Uint8Array
}

export interface Address_P2SH {
    __kind: 'P2SH'
    value: Uint8Array
}

export interface Address_P2WPKHv0 {
    __kind: 'P2WPKHv0'
    value: Uint8Array
}

export interface Address_P2WSHv0 {
    __kind: 'P2WSHv0'
    value: Uint8Array
}

export interface BlockHeader {
    merkleRoot: H256Le
    target: bigint
    timestamp: number
    version: number
    hash: H256Le
    hashPrevBlock: H256Le
    nonce: number
}

export type TokenSymbol = TokenSymbol_DOT | TokenSymbol_IBTC | TokenSymbol_INTR | TokenSymbol_KSM | TokenSymbol_KBTC | TokenSymbol_KINT

export interface TokenSymbol_DOT {
    __kind: 'DOT'
}

export interface TokenSymbol_IBTC {
    __kind: 'IBTC'
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

export type LpToken = LpToken_Token | LpToken_ForeignAsset | LpToken_StableLpToken

export interface LpToken_Token {
    __kind: 'Token'
    value: TokenSymbol
}

export interface LpToken_ForeignAsset {
    __kind: 'ForeignAsset'
    value: number
}

export interface LpToken_StableLpToken {
    __kind: 'StableLpToken'
    value: number
}

export interface VaultCurrencyPair {
    collateral: CurrencyId
    wrapped: CurrencyId
}

export interface H256Le {
    content: Uint8Array
}
