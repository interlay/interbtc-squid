import {create} from './_registry'
import {AccountId} from '@polkadot/types/interfaces'
import {SubstrateEvent} from '@subsquid/hydra-common'
import {Collateral} from '@interlay/interbtc-api'

export namespace VaultRegistry {
  export class RegisterVaultEvent {
    constructor(private event: SubstrateEvent) {}

    get params(): [AccountId, Collateral] {
      return [create('AccountId', this.event.params[0].value), create('Collateral', this.event.params[1].value)]
    }
  }

}
