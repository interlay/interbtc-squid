import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { Compact } from "@polkadot/types";
import { BtcPublicKey, Collateral, CurrencyId } from "@interlay/interbtc-api";

export namespace VaultRegistry {
  export class RegisterVaultCall {
    public readonly extrinsic: SubstrateExtrinsic;
    public readonly expectedArgTypes = [
      "Compact<Collateral>",
      "BtcPublicKey",
      "CurrencyId",
    ];

    constructor(public readonly ctx: SubstrateEvent) {
      if (ctx.extrinsic === undefined) {
        throw new Error(`No call data has been provided`);
      }
      this.extrinsic = ctx.extrinsic;
    }

    get args(): RegisterVault_Args {
      return new RegisterVault_Args(this.extrinsic);
    }

    validateArgs(): boolean {
      if (this.expectedArgTypes.length !== this.extrinsic.args.length) {
        return false;
      }
      let valid = true;
      this.expectedArgTypes.forEach((type, i) => {
        if (type !== this.extrinsic.args[i].type) {
          valid = false;
        }
      });
      return valid;
    }
  }

  class RegisterVault_Args {
    constructor(public readonly extrinsic: SubstrateExtrinsic) {}

    get collateral(): Compact<Collateral> {
      return createTypeUnsafe<Compact<Collateral> & Codec>(
        typeRegistry,
        "Compact<Collateral>",
        [this.extrinsic.args[0].value]
      );
    }

    get publicKey(): BtcPublicKey {
      return createTypeUnsafe<BtcPublicKey & Codec>(
        typeRegistry,
        "BtcPublicKey",
        [this.extrinsic.args[1].value]
      );
    }

    get currencyId(): CurrencyId {
      return createTypeUnsafe<CurrencyId & Codec>(typeRegistry, "CurrencyId", [
        this.extrinsic.args[2].value,
      ]);
    }
  }
}
