import {create} from './_registry'
import {SubstrateExtrinsic} from '@subsquid/hydra-common'
import {RawBlockHeader} from '@interlay/interbtc-api'

export namespace Relay {
  /**
   *  Stores a single new block header
   * 
   *  # Arguments
   * 
   *  * `raw_block_header` - 80 byte raw Bitcoin block header.
   * 
   *  # <weight>
   *  Key: C (len of chains), P (len of positions)
   *  - Storage Reads:
   *  	- One storage read to check that parachain is not shutdown. O(1)
   *  	- One storage read to check if relayer authorization is disabled. O(1)
   *  	- One storage read to check if relayer is authorized. O(1)
   *  	- One storage read to check if block header is stored. O(1)
   *  	- One storage read to retrieve parent block hash. O(1)
   *  	- One storage read to check if difficulty check is disabled. O(1)
   *  	- One storage read to retrieve last re-target. O(1)
   *  	- One storage read to retrieve all Chains. O(C)
   *  - Storage Writes:
   *      - One storage write to store block hash. O(1)
   *      - One storage write to store block header. O(1)
   *  	- One storage mutate to extend main chain. O(1)
   *      - One storage write to store best block hash. O(1)
   *      - One storage write to store best block height. O(1)
   *  - Notable Computation:
   *  	- O(P) sort to reorg chains.
   *  - Events:
   *  	- One event for block stored (fork or extension).
   * 
   *  Total Complexity: O(C + P)
   *  # </weight>
   */
  export class Store_block_headerCall {
    private _extrinsic: SubstrateExtrinsic

    constructor(extrinsic: SubstrateExtrinsic) {
      this._extrinsic = extrinsic
    }

    get raw_block_header(): RawBlockHeader {
      return create('RawBlockHeader', this._extrinsic.args[0].value)
    }
  }
}
