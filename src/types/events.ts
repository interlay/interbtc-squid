import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v6 from './v6'
import * as v8 from './v8'

export class BtcRelayStoreMainChainHeaderEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'btcRelay.StoreMainChainHeader')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('btcRelay.StoreMainChainHeader') === '3a178b8aa8fda895164a8d649ecb2cd8dfbc42daa449008b2b703520d2768e74'
  }

  get asV6(): {blockHeight: number, blockHash: v6.H256Le, relayerId: v6.AccountId32} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {blockHeight: number, blockHash: v6.H256Le, relayerId: v6.AccountId32} {
    deprecateLatest()
    return this.asV6
  }
}

export class IssueCancelIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.CancelIssue')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('issue.CancelIssue') === 'dd10ea1f015728a5572b75e327aaa9f9728439faeebf53fdb44dfd30dab17474'
  }

  get asV6(): {issueId: v6.H256, requester: v6.AccountId32, griefingCollateral: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {issueId: v6.H256, requester: v6.AccountId32, griefingCollateral: bigint} {
    deprecateLatest()
    return this.asV6
  }
}

export class IssueExecuteIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.ExecuteIssue')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('issue.ExecuteIssue') === '59b466a6e015f85e94002e9665fe08f0186b5e846ef923083d28d6a163240ef5'
  }

  get asV6(): {issueId: v6.H256, requester: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('issue.ExecuteIssue') === '566276893c9ed457216387ebf43f6abe618732a1c66cf1fce9ec1e6549b3e23a'
  }

  get asV8(): {issueId: v8.H256, requester: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {issueId: v8.H256, requester: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class IssueRequestIssueEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'issue.RequestIssue')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('issue.RequestIssue') === 'be2b62a770052ad3efd867964c7b393dc73d5a0d8e1e478ae5a5a98e49d5a24c'
  }

  get asV6(): {issueId: v6.H256, requester: v6.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v6.VaultId, vaultAddress: v6.Address, vaultPublicKey: v6.PublicKey} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('issue.RequestIssue') === '769ffeb97beaff8fe740f3751c457b8fc376b93ebf99b41c29772f70804e3b37'
  }

  get asV8(): {issueId: v8.H256, requester: v8.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v8.VaultId, vaultAddress: v8.Address, vaultPublicKey: v8.PublicKey} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {issueId: v8.H256, requester: v8.AccountId32, amount: bigint, fee: bigint, griefingCollateral: bigint, vaultId: v8.VaultId, vaultAddress: v8.Address, vaultPublicKey: v8.PublicKey} {
    deprecateLatest()
    return this.asV8
  }
}

export class OracleFeedValuesEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'oracle.FeedValues')
  }

  /**
   * Event emitted when exchange rate is set
   */
  get isV6(): boolean {
    return this.ctx._chain.getEventHash('oracle.FeedValues') === 'd9737bee3d7f81120cc278add05171ccee95498f161d512210a7510b4950f7d3'
  }

  /**
   * Event emitted when exchange rate is set
   */
  get asV6(): {oracleId: v6.AccountId32, values: [v6.Key, v6.FixedU128][]} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Event emitted when exchange rate is set
   */
  get isV8(): boolean {
    return this.ctx._chain.getEventHash('oracle.FeedValues') === 'a69282ccd8a5eae74ab42e55b767eebed71035da539edf78068263113d72072e'
  }

  /**
   * Event emitted when exchange rate is set
   */
  get asV8(): {oracleId: v8.AccountId32, values: [v8.Key, v8.FixedU128][]} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {oracleId: v8.AccountId32, values: [v8.Key, v8.FixedU128][]} {
    deprecateLatest()
    return this.asV8
  }
}

export class RedeemCancelRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.CancelRedeem')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.CancelRedeem') === '2bcc8077005e6b218259975e52323959dc8afc6d8c7badbecbf2a61537bb5268'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, slashedAmount: bigint, status: v6.RedeemRequestStatus} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('redeem.CancelRedeem') === '046a69f6b3ee0b3f2ab566a61e763c659684c61891baeb681e8bbd95a6268e50'
  }

  get asV8(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, slashedAmount: bigint, status: v8.RedeemRequestStatus} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, slashedAmount: bigint, status: v8.RedeemRequestStatus} {
    deprecateLatest()
    return this.asV8
  }
}

export class RedeemExecuteRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.ExecuteRedeem')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.ExecuteRedeem') === '1add2e320d4e7879c83a5b61c78afbb40f3b06b1529861420c662d5e8f47074f'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('redeem.ExecuteRedeem') === 'd63793fdce1f0d01145e4515a95523737b88c284bd133a8238d7707855f20a21'
  }

  get asV8(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint, transferFee: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class RedeemRequestRedeemEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'redeem.RequestRedeem')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('redeem.RequestRedeem') === '4d144a1c040e0d84dc42a910a9062493a167635c8cc57caa9564f0944d4f1fd5'
  }

  get asV6(): {redeemId: v6.H256, redeemer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v6.Address, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('redeem.RequestRedeem') === '90a5e843b2f541203e4741dc0f7e19b922501aae7a1358ea8926a4ab6207281a'
  }

  get asV8(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v8.Address, transferFee: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {redeemId: v8.H256, redeemer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint, premium: bigint, btcAddress: v8.Address, transferFee: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class RefundExecuteRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.ExecuteRefund')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('refund.ExecuteRefund') === '94bc6f77689dd648726d95cd7f3205478aa99084d6afc894c75c0a2a5b010e7a'
  }

  get asV6(): {refundId: v6.H256, issuer: v6.AccountId32, vaultId: v6.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('refund.ExecuteRefund') === '94fee728180908c2c66a2421de1de144cc68556c47258a94f0ce5938f3b582a6'
  }

  get asV8(): {refundId: v8.H256, issuer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {refundId: v8.H256, issuer: v8.AccountId32, vaultId: v8.VaultId, amount: bigint, fee: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class RefundRequestRefundEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'refund.RequestRefund')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('refund.RequestRefund') === 'e6581c6458a83c164c3a8c899a2d06bdb47c7ef1e436cc660d12424793eeb20b'
  }

  get asV6(): {refundId: v6.H256, issuer: v6.AccountId32, amount: bigint, vaultId: v6.VaultId, btcAddress: v6.Address, issueId: v6.H256, fee: bigint, transferFee: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('refund.RequestRefund') === '77f94c96c50a3d1a974b0cbb518779a172d929745367f4e917ac7bfd71df8750'
  }

  get asV8(): {refundId: v8.H256, issuer: v8.AccountId32, amount: bigint, vaultId: v8.VaultId, btcAddress: v8.Address, issueId: v8.H256, fee: bigint, transferFee: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {refundId: v8.H256, issuer: v8.AccountId32, amount: bigint, vaultId: v8.VaultId, btcAddress: v8.Address, issueId: v8.H256, fee: bigint, transferFee: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class SecurityUpdateActiveBlockEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'security.UpdateActiveBlock')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('security.UpdateActiveBlock') === '7eefc4ef9a2f34cfee29738715aa72fe2a31ffd39b1d2a62f1cef547b70ed1fd'
  }

  get asV6(): {blockNumber: number} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV6
  }

  get asLatest(): {blockNumber: number} {
    deprecateLatest()
    return this.asV6
  }
}

export class VaultRegistryDecreaseLockedCollateralEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.DecreaseLockedCollateral')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.DecreaseLockedCollateral') === '013307983c6902ec09af3b8afd9dc1ae6163a72a56585cec1235ec83322aedbb'
  }

  get asV6(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.DecreaseLockedCollateral') === '1b67d1d86e1332ee8bb03735b995c67676bbcedc0903eb4d04ca74c4d4a61280'
  }

  get asV8(): {currencyPair: v8.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {currencyPair: v8.VaultCurrencyPair, delta: bigint, total: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class VaultRegistryIncreaseLockedCollateralEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.IncreaseLockedCollateral')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.IncreaseLockedCollateral') === '013307983c6902ec09af3b8afd9dc1ae6163a72a56585cec1235ec83322aedbb'
  }

  get asV6(): {currencyPair: v6.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.IncreaseLockedCollateral') === '1b67d1d86e1332ee8bb03735b995c67676bbcedc0903eb4d04ca74c4d4a61280'
  }

  get asV8(): {currencyPair: v8.VaultCurrencyPair, delta: bigint, total: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {currencyPair: v8.VaultCurrencyPair, delta: bigint, total: bigint} {
    deprecateLatest()
    return this.asV8
  }
}

export class VaultRegistryRegisterVaultEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vaultRegistry.RegisterVault')
  }

  get isV6(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.RegisterVault') === '4cbc2ca3411358adf016c880b9989dfbc8726729eb8f2cc0de2e27a21b93ab8b'
  }

  get asV6(): {vaultId: v6.VaultId, collateral: bigint} {
    assert(this.isV6)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isV8(): boolean {
    return this.ctx._chain.getEventHash('vaultRegistry.RegisterVault') === 'f1a397e34fa2b35cf9f2efc2cd39d51e3a638ef819dd4554b3d4e5af26e5b4d1'
  }

  get asV8(): {vaultId: v8.VaultId, collateral: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {vaultId: v8.VaultId, collateral: bigint} {
    deprecateLatest()
    return this.asV8
  }
}
