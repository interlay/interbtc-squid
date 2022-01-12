import {create} from './_registry'
import {H256} from '@polkadot/types/interfaces'
import {Bytes} from '@polkadot/types'
import {SubstrateExtrinsic} from '@subsquid/hydra-common'

export namespace Redeem {
  /**
   * A Vault calls this function after receiving an RequestRedeem event with their public key.
   * Before calling the function, the Vault transfers the specific amount of BTC to the BTC address
   * given in the original redeem request. The Vault completes the redeem with this function.
   * 
   * # Arguments
   * 
   * * `origin` - anyone executing this redeem request
   * * `redeem_id` - identifier of redeem request as output from request_redeem
   * * `tx_id` - transaction hash
   * * `tx_block_height` - block number of collateral chain
   * * `merkle_proof` - raw bytes
   * * `raw_tx` - raw bytes
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
