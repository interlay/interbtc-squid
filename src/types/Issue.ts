import {create} from './_registry'
import {AccountId, H256} from '@polkadot/types/interfaces'
import {SubstrateEvent} from '@subsquid/hydra-common'
import {BtcAddress, BtcPublicKey, Collateral, Wrapped} from '@interlay/interbtc-api'

export namespace Issue {
  export class RequestIssueEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Wrapped, Wrapped, Collateral, AccountId, BtcAddress, BtcPublicKey] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Wrapped', this.event.params[2].value), create('Wrapped', this.event.params[3].value), create('Collateral', this.event.params[4].value), create('AccountId', this.event.params[5].value), create('BtcAddress', this.event.params[6].value), create('BtcPublicKey', this.event.params[7].value)]
    }
  }

  export class ExecuteIssueEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Wrapped, AccountId, Wrapped] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Wrapped', this.event.params[2].value), create('AccountId', this.event.params[3].value), create('Wrapped', this.event.params[4].value)]
    }
  }

  export class CancelIssueEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Collateral] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Collateral', this.event.params[2].value)]
    }
  }

}
