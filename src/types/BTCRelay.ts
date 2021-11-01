import {create} from './_registry'
import {AccountId} from '@polkadot/types/interfaces'
import {u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'
import {H256Le} from '@interlay/interbtc-api'

export namespace BTCRelay {
  /**
   *  new chain height, block_header_hash, relayer_id
   */
  export class StoreMainChainHeaderEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32, H256Le, AccountId] {
      return [create('u32', this.event.params[0].value), create('H256Le', this.event.params[1].value), create('AccountId', this.event.params[2].value)]
    }
  }

}
