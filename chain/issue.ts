import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { AccountId, H256 } from "@polkadot/types/interfaces";
import {
  BtcAddress,
  BtcPublicKey,
  Collateral,
  Wrapped,
} from "@interlay/interbtc-api";

export namespace Issue {
  export class RequestIssueEvent {
    public readonly expectedParamTypes = [
      "H256",
      "AccountId",
      "Wrapped",
      "Wrapped",
      "Collateral",
      "AccountId",
      "BtcAddress",
      "BtcPublicKey",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [
      H256,
      AccountId,
      Wrapped,
      Wrapped,
      Collateral,
      AccountId,
      BtcAddress,
      BtcPublicKey
    ] {
      return [
        createTypeUnsafe<H256 & Codec>(typeRegistry, "H256", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[1].value,
        ]),
        createTypeUnsafe<Wrapped & Codec>(typeRegistry, "Wrapped", [
          this.ctx.params[2].value,
        ]),
        createTypeUnsafe<Wrapped & Codec>(typeRegistry, "Wrapped", [
          this.ctx.params[3].value,
        ]),
        createTypeUnsafe<Collateral & Codec>(typeRegistry, "Collateral", [
          this.ctx.params[4].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[5].value,
        ]),
        createTypeUnsafe<BtcAddress & Codec>(typeRegistry, "BtcAddress", [
          this.ctx.params[6].value,
        ]),
        createTypeUnsafe<BtcPublicKey & Codec>(typeRegistry, "BtcPublicKey", [
          this.ctx.params[7].value,
        ]),
      ];
    }

    validateParams(): boolean {
      if (this.expectedParamTypes.length !== this.ctx.params.length) {
        return false;
      }
      let valid = true;
      this.expectedParamTypes.forEach((type, i) => {
        if (type !== this.ctx.params[i].type) {
          valid = false;
        }
      });
      return valid;
    }
  }
}
