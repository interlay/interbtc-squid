import {create} from './_registry'
import {u32} from '@polkadot/types'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Security {
  export class UpdateActiveBlockEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [u32] {
      return [create('u32', this.event.params[0].value)]
    }
  }

}
