import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v0 from './v0'
import * as v1 from './v1'
import * as v6 from './v6'

export class BtcRelayStoreMainChainHeaderEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'btcRelay.StoreMainChainHeader')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('btcRelay.StoreMainChainHeader') === '95dee8908caabf2036a3ea0a5d45727d4b9c26d2fd71360d131465d20e63a9bb'
  }

  get asV0(): {blockHeight: number, blockHash: v0.H256Le, relayerId: v0.AccountId32} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV0
  }

  get asLatest(): {blockHeight: number, blockHash: v0.H256Le, relayerId: v0.AccountId32} {
    deprecateLatest()
    return this.asV0
  }
}

export class IssueCancelIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.CancelIssue')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('issue.CancelIssue') === '0dd678891d3e6b0716b349b9671b4b5cdf29982969ef990d202a1d0233496c82'
  }

  get asV0(): {issueId: v0.H256, requester: v0.AccountId32, griefingCollateral: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV0
  }

  get asLatest(): {issueId: v0.H256, requester: v0.AccountId32, griefingCollateral: bigint} {
    deprecateLatest()
    return this.asV0
  }
}

export class IssueExecuteIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.ExecuteIssue')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('issue.ExecuteIssue') === '252c84023f43ce2aa7ea664a8e99bbe764b1062c29145d5319b1eae606fbbf24'
  }

  get asV0(): {issueId: v0.H256, requester: v0.AccountId32, vaultId: v0.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('issue.ExecuteIssue') === '2a949650f14b74e697a164b680bca04d84f10a51ebe05d9809ddd4fe0d99cc88'
  }

  get asV6(): {issueId: v6.H256, requester: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {issueId: v6.H256, requester: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class IssueRequestIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.RequestIssue')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('issue.RequestIssue') === 'd8d8169666cc50d9eb44a549518d3c889613cc95606d6e0868aa0bf04a483c2d'
  }

  get asV0(): {issueId: v0.H256, requester: v0.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v0.VaultId, vaultAddress: v0.Address, vaultPublicKey: v0.PublicKey} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('issue.RequestIssue') === '755f95b7566cb28d736005d847edb0e2d61716fe8d172318f25ad15cc9d761cf'
  }

  get asV6(): {issueId: v6.H256, requester: v6.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v6.VaultId, vaultAddress: v6.Address, vaultPublicKey: v6.PublicKey} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {issueId: v6.H256, requester: v6.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v6.VaultId, vaultAddress: v6.Address, vaultPublicKey: v6.PublicKey} {
    deprecateLatest()
    return this.asV6
  }
}

export class OracleFeedValuesEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'oracle.FeedValues')
  }

  /**
   * Event emitted when exchange rate is set
   */
  get isV0(): boolean {
    return this.ctx._chain.getEventHash('oracle.FeedValues') === '54aa984108ee0483098f9b2b5e892cc184a4a622b09121f10574ad10057e8457'
  }

  /**
   * Event emitted when exchange rate is set
   */
  get asV0(): {oracleId: v0.AccountId32, values: [v0.Key, v0.FixedU128][]} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Event emitted when exchange rate is set
   */
  get isV6(): boolean {
    return this.ctx._chain.getEventHash('oracle.FeedValues') === '8f1cf2446cdd43af96cd2c0fb837b7f37e97e19c1f2c4406d5f7f2ddc4d06ca4'
  }

  /**
   * Event emitted when exchange rate is set
   */
  get asV6(): {oracleId: v6.AccountId32, values: [v6.Key, v6.FixedU128][]} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {oracleId: v6.AccountId32, values: [v6.Key, v6.FixedU128][]} {
    deprecateLatest()
    return this.asV6
  }
}

export class RedeemCancelRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.CancelRedeem')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('redeem.CancelRedeem') === 'c74b4036d60175cc537168e4af51c63c75ac876c2f69b9d739b2a82ded2148dc'
  }

  get asV0(): {redeemId: v0.H256, redeemer: v0.AccountId32, vaultId: v0.VaultId, slashedAmount: bigint, status: v0.RedeemRequestStatus} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.CancelRedeem') === '4de55d3c405d3e7fa40c57d5b7ee83cf17d0c5debfd31d3df4d4f95b49317cdb'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, slashedAmount: bigint, status: v6.RedeemRequestStatus} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, slashedAmount: bigint, status: v6.RedeemRequestStatus} {
    deprecateLatest()
    return this.asV6
  }
}

export class RedeemExecuteRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.ExecuteRedeem')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('redeem.ExecuteRedeem') === 'f5812cdce33283c15408accc56e46a871fcf0e5baa66a92650aa95a13858fbce'
  }

  get asV0(): {redeemId: v0.H256, redeemer: v0.AccountId32, vaultId: v0.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.ExecuteRedeem') === '64dc6a9b5f18ba2fd9fe3c25738a0324720b57c7db7d23ce29c02b72e0f68e43'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class RedeemRequestRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.RequestRedeem')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('redeem.RequestRedeem') === '904edc767c29a90acca701fceb5c2281aa4d0316e8862fd5533ac26475548d8c'
  }

  get asV0(): {redeemId: v0.H256, redeemer: v0.AccountId32, vaultId: v0.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v0.Address, transferFee: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.RequestRedeem') === '789973ba110827359354e109104fa51c5d63ddec4d27e0ea4ca0925867492be7'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v6.Address, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v6.Address, transferFee: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class RefundExecuteRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.ExecuteRefund')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('refund.ExecuteRefund') === '5004f4b36287aeca12362ab0aae5c567a0e5708769aa2f1b7f7c301ca342aa75'
  }

  get asV0(): {refundId: v0.H256, issuer: v0.AccountId32, vaultId: v0.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('refund.ExecuteRefund') === '5938815615474112793a3351e2537a6b823719e2ba7b2cdedc3634ab96b60af8'
  }

  get asV6(): {refundId: v6.H256, issuer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {refundId: v6.H256, issuer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class RefundRequestRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.RequestRefund')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('refund.RequestRefund') === 'be9f382dd92a00c752accd94d7da14450a39935cf288cbbc840723159a27a9ee'
  }

  get asV0(): {refundId: v0.H256, issuer: v0.AccountId32, amount: bigint, vaultId: v0.VaultId, btcAddress: v0.Address, issueId: v0.H256, fee: bigint, transferFee: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('refund.RequestRefund') === 'cac0c5b1ed80807227b578ef1df999a9c713cabc1f2ab5bc2114a80fa26a7f98'
  }

  get asV6(): {refundId: v6.H256, issuer: v6.AccountId32, amount: bigint, vaultId: v6.VaultId, btcAddress: v6.Address, issueId: v6.H256, fee: bigint, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {refundId: v6.H256, issuer: v6.AccountId32, amount: bigint, vaultId: v6.VaultId, btcAddress: v6.Address, issueId: v6.H256, fee: bigint, transferFee: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class SecurityUpdateActiveBlockEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'security.UpdateActiveBlock')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('security.UpdateActiveBlock') === '3c8ee7449a34e8f4f2804a4d3dd2129f7528445d09c6ee71b51f68ca5aedf6b5'
  }

  get asV0(): {blockNumber: number} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV0
  }

  get asLatest(): {blockNumber: number} {
    deprecateLatest()
    return this.asV0
  }
}

export class VaultRegistryDecreaseLockedCollateralEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.DecreaseLockedCollateral')
  }

  get isV1(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.DecreaseLockedCollateral') === '63bd33e0a9d55896541f08d420b91ec127eab8b5433a33e7af88626d2bb66932'
  }

  get asV1(): {currencyPair: v1.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV1)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.DecreaseLockedCollateral') === '8459984e0f8f0b589467b5dff9d063e02f046c83e218927977f00f2333fc8880'
  }

  get asV6(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class VaultRegistryIncreaseLockedCollateralEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.IncreaseLockedCollateral')
  }

  get isV1(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.IncreaseLockedCollateral') === '1c2276163979cd5c1d6df91d75b68c06f029c075f50c0eb719badbcdf6bec5c8'
  }

  get asV1(): {currencyPair: v1.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV1)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.IncreaseLockedCollateral') === 'df07bb2be6f98c8ef2f3b7b0e13e586828b796f0323a528af7306a8915b0b110'
  }

  get asV6(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class VaultRegistryRegisterVaultEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.RegisterVault')
  }

  get isV0(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.RegisterVault') === '6c33144d13a681d34ac3299862f414e2d0d8b45de926d4ccb067b88e00745298'
  }

  get asV0(): {vaultId: v0.VaultId, collateral: bigint} {
    assert(this.isV0)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.RegisterVault') === 'c4ec1d37bef41a47ff9c320b3e297408a470d89c8cb082b299ef617335fd05de'
  }

  get asV6(): {vaultId: v6.VaultId, collateral: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {vaultId: v6.VaultId, collateral: bigint} {
    deprecateLatest()
    return this.asV6
  }
}
