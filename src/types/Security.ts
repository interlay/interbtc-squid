import {create} from './_registry'
import {BlockNumber} from '@polkadot/types/interfaces'
import {SubstrateEvent} from '@subsquid/hydra-common'

export namespace Security {
  export class UpdateActiveBlockEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [BlockNumber] {
      return [create('BlockNumber', this.event.params[0].value)]
    }
  }

}
