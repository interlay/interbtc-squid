import {create} from './_registry'
import {AccountId, H256} from '@polkadot/types/interfaces'
import {SubstrateEvent} from '@subsquid/hydra-common'
import {BtcAddress, Wrapped} from '@interlay/interbtc-api'

export namespace Refund {
  /**
   *  refund_id, issuer, amount_without_fee, vault, btc_address, issue_id, fee
   */
  export class RequestRefundEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Wrapped, AccountId, BtcAddress, H256, Wrapped] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Wrapped', this.event.params[2].value), create('AccountId', this.event.params[3].value), create('BtcAddress', this.event.params[4].value), create('H256', this.event.params[5].value), create('Wrapped', this.event.params[6].value)]
    }
  }

  /**
   *  refund_id, issuer, vault, amount, fee
   */
  export class ExecuteRefundEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, AccountId, Wrapped, Wrapped] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('AccountId', this.event.params[2].value), create('Wrapped', this.event.params[3].value), create('Wrapped', this.event.params[4].value)]
    }
  }

}
