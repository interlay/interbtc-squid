import assert from 'assert'
import {StorageContext, Result} from './support'

export class IssueIssuePeriodStorage {
  constructor(private ctx: StorageContext) {}

  /**
   *  The time difference in number of blocks between an issue request is created
   *  and required completion time by a user. The issue period has an upper limit
   *  to prevent griefing of vault collateral.
   */
  get isV1() {
    return this.ctx._chain.getStorageItemTypeHash('Issue', 'IssuePeriod') === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
  }

  /**
   *  The time difference in number of blocks between an issue request is created
   *  and required completion time by a user. The issue period has an upper limit
   *  to prevent griefing of vault collateral.
   */
  async getAsV1(): Promise<number> {
    assert(this.isV1)
    return this.ctx._chain.getStorage(this.ctx.block.hash, 'Issue', 'IssuePeriod')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this.ctx._chain.getStorageItemTypeHash('Issue', 'IssuePeriod') != null
  }
}

export class RedeemRedeemPeriodStorage {
  constructor(private ctx: StorageContext) {}

  /**
   *  The time difference in number of blocks between a redeem request is created and required completion time by a
   *  vault. The redeem period has an upper limit to ensure the user gets their BTC in time and to potentially
   *  punish a vault for inactivity or stealing BTC.
   */
  get isV1() {
    return this.ctx._chain.getStorageItemTypeHash('Redeem', 'RedeemPeriod') === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
  }

  /**
   *  The time difference in number of blocks between a redeem request is created and required completion time by a
   *  vault. The redeem period has an upper limit to ensure the user gets their BTC in time and to potentially
   *  punish a vault for inactivity or stealing BTC.
   */
  async getAsV1(): Promise<number> {
    assert(this.isV1)
    return this.ctx._chain.getStorage(this.ctx.block.hash, 'Redeem', 'RedeemPeriod')
  }

  /**
   * Checks whether the storage item is defined for the current chain version.
   */
  get isExists(): boolean {
    return this.ctx._chain.getStorageItemTypeHash('Redeem', 'RedeemPeriod') != null
  }
}
