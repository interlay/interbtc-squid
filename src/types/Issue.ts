import {create} from './_registry'
import {AccountId, H256} from '@polkadot/types/interfaces'
import {Bytes} from '@polkadot/types'
import {SubstrateEvent, SubstrateExtrinsic} from '@subsquid/hydra-common'
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

  /**
   *  Finalize the issuance of tokens
   * 
   *  # Arguments
   * 
   *  * `origin` - sender of the transaction
   *  * `issue_id` - identifier of issue request as output from request_issue
   *  * `tx_block_height` - block number of collateral chain
   *  * `merkle_proof` - raw bytes
   *  * `raw_tx` - raw bytes
   */
  export class Execute_issueCall {
    private _extrinsic: SubstrateExtrinsic

    constructor(extrinsic: SubstrateExtrinsic) {
      this._extrinsic = extrinsic
    }

    get issue_id(): H256 {
      return create('H256', this._extrinsic.args[0].value)
    }

    get merkle_proof(): Bytes {
      return create('Bytes', this._extrinsic.args[1].value)
    }

    get raw_tx(): Bytes {
      return create('Bytes', this._extrinsic.args[2].value)
    }
  }
  /**
   *  Cancel the issuance of tokens if expired
   * 
   *  # Arguments
   * 
   *  * `origin` - sender of the transaction
   *  * `issue_id` - identifier of issue request as output from request_issue
   */
  export class Cancel_issueCall {
    private _extrinsic: SubstrateExtrinsic

    constructor(extrinsic: SubstrateExtrinsic) {
      this._extrinsic = extrinsic
    }

    get issue_id(): H256 {
      return create('H256', this._extrinsic.args[0].value)
    }
  }
}
