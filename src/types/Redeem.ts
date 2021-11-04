import {create} from './_registry'
import {AccountId, H256} from '@polkadot/types/interfaces'
import {Bytes} from '@polkadot/types'
import {SubstrateEvent, SubstrateExtrinsic} from '@subsquid/hydra-common'
import {BtcAddress, Collateral, RedeemRequestStatus, Wrapped} from '@interlay/interbtc-api'

export namespace Redeem {
  export class RequestRedeemEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Wrapped, Wrapped, Collateral, AccountId, BtcAddress, Wrapped] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Wrapped', this.event.params[2].value), create('Wrapped', this.event.params[3].value), create('Collateral', this.event.params[4].value), create('AccountId', this.event.params[5].value), create('BtcAddress', this.event.params[6].value), create('Wrapped', this.event.params[7].value)]
    }
  }

  export class ExecuteRedeemEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, Wrapped, Wrapped, AccountId, Wrapped] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('Wrapped', this.event.params[2].value), create('Wrapped', this.event.params[3].value), create('AccountId', this.event.params[4].value), create('Wrapped', this.event.params[5].value)]
    }
  }

  export class CancelRedeemEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [H256, AccountId, AccountId, Collateral, RedeemRequestStatus] {
      return [create('H256', this.event.params[0].value), create('AccountId', this.event.params[1].value), create('AccountId', this.event.params[2].value), create('Collateral', this.event.params[3].value), create('RedeemRequestStatus', this.event.params[4].value)]
    }
  }

  /**
   *  A Vault calls this function after receiving an RequestRedeem event with their public key.
   *  Before calling the function, the Vault transfers the specific amount of BTC to the BTC address
   *  given in the original redeem request. The Vault completes the redeem with this function.
   * 
   *  # Arguments
   * 
   *  * `origin` - anyone executing this redeem request
   *  * `redeem_id` - identifier of redeem request as output from request_redeem
   *  * `tx_id` - transaction hash
   *  * `tx_block_height` - block number of collateral chain
   *  * `merkle_proof` - raw bytes
   *  * `raw_tx` - raw bytes
   */
  export class Execute_redeemCall {
    private _extrinsic: SubstrateExtrinsic

    constructor(extrinsic: SubstrateExtrinsic) {
      this._extrinsic = extrinsic
    }

    get redeem_id(): H256 {
      return create('H256', this._extrinsic.args[0].value)
    }

    get merkle_proof(): Bytes {
      return create('Bytes', this._extrinsic.args[1].value)
    }

    get raw_tx(): Bytes {
      return create('Bytes', this._extrinsic.args[2].value)
    }
  }
}
