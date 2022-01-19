import assert from 'assert'
import {EventContext, Result} from './support'
import * as v1 from './v1'

export class BtcRelayStoreMainChainHeaderEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'btcRelay.StoreMainChainHeader')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('btcRelay.StoreMainChainHeader') === '70f06b56bb889238f54fc538a77b020167478d4b02726359c9adefaea7b65ada'
  }

  get asLatest(): {blockHeight: number, blockHash: v1.H256Le, relayerId: v1.AccountId32} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class IssueCancelIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.CancelIssue')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('issue.CancelIssue') === 'd543e2f8c1a9ef1d1e526a3cd97f5c68f6b81d00f71ee792fb7a4432912767a0'
  }

  get asLatest(): {issueId: v1.H256, requester: v1.AccountId32, griefingCollateral: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class IssueExecuteIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.ExecuteIssue')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('issue.ExecuteIssue') === 'a23759b6fa3d6d4eb180bd529002374b424d005f26cb5312ec3ef30ba11db97c'
  }

  get asLatest(): {issueId: v1.H256, requester: v1.AccountId32, vaultId: v1.VaultId, amount: bigint, fee: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class IssueRequestIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.RequestIssue')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('issue.RequestIssue') === '366f435ac073bad1922a13cb70be2e62f860f5516f9969e77454b0ceb1a63271'
  }

  get asLatest(): {issueId: v1.H256, requester: v1.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v1.VaultId, vaultAddress: v1.Address, vaultPublicKey: v1.PublicKey} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class OracleFeedValuesEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'oracle.FeedValues')
  }

  /**
   * Event emitted when exchange rate is set
   */
  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('oracle.FeedValues') === '83c423f42f1ca28d5223f91beaaae530835c040f9f9433c6ca078d4751b4f494'
  }

  /**
   * Event emitted when exchange rate is set
   */
  get asLatest(): {oracleId: v1.AccountId32, values: [v1.Key, v1.FixedU128][]} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class RedeemCancelRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.CancelRedeem')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('redeem.CancelRedeem') === 'd35d9be452f915fea66a3da0d29c736f1b311eb81e21e12d41e43b0b09c51245'
  }

  get asLatest(): {redeemId: v1.H256, redeemer: v1.AccountId32, vaultId: v1.VaultId, slashedAmount: bigint, status: v1.RedeemRequestStatus} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class RedeemExecuteRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.ExecuteRedeem')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('redeem.ExecuteRedeem') === '37e7c3604f227f72ec752ea7a9efe702369c4fcaf3a3927f94ff174f8f48218e'
  }

  get asLatest(): {redeemId: v1.H256, redeemer: v1.AccountId32, vaultId: v1.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class RedeemRequestRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.RequestRedeem')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('redeem.RequestRedeem') === '4da0807b8fa7f2d10f906c82cad587adb2027b9394c825974068d86843769bd0'
  }

  get asLatest(): {redeemId: v1.H256, redeemer: v1.AccountId32, vaultId: v1.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v1.Address, transferFee: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class RefundExecuteRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.ExecuteRefund')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('refund.ExecuteRefund') === '173b36f71c93c06b00697d5eb330e0fb1454a365b533cc8e06e6f796185002ba'
  }

  get asLatest(): {refundId: v1.H256, issuer: v1.AccountId32, vaultId: v1.VaultId, amount: bigint, fee: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class RefundRequestRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.RequestRefund')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('refund.RequestRefund') === 'e7ca4d50f858092d2302b46cb92984625873660ab2d9b1f63802077c95bd1a15'
  }

  get asLatest(): {refundId: v1.H256, issuer: v1.AccountId32, amount: bigint, vaultId: v1.VaultId, btcAddress: v1.Address, issueId: v1.H256, fee: bigint, transferFee: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class SecurityUpdateActiveBlockEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'security.UpdateActiveBlock')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('security.UpdateActiveBlock') === '3c8ee7449a34e8f4f2804a4d3dd2129f7528445d09c6ee71b51f68ca5aedf6b5'
  }

  get asLatest(): {blockNumber: number} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}

export class VaultRegistryRegisterVaultEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.RegisterVault')
  }

  get isLatest(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.RegisterVault') === '3492fded8d6d88f53f414ba4e76d0e00a89de53c82e420ed36b6d213366a9d5e'
  }

  get asLatest(): {vaultId: v1.VaultId, collateral: bigint} {
    assert(this.isLatest)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }
}
