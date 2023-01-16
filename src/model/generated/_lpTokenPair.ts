import assert from "assert"
import * as marshal from "./marshal"
import {LpToken, fromJsonLpToken} from "./_lpToken"

export class LpTokenPair {
    public readonly isTypeOf = 'LpTokenPair'
    private _token0!: LpToken
    private _token1!: LpToken

    constructor(props?: Partial<Omit<LpTokenPair, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._token0 = fromJsonLpToken(json.token0)
            this._token1 = fromJsonLpToken(json.token1)
        }
    }

    get token0(): LpToken {
        assert(this._token0 != null, 'uninitialized access')
        return this._token0
    }

    set token0(value: LpToken) {
        this._token0 = value
    }

    get token1(): LpToken {
        assert(this._token1 != null, 'uninitialized access')
        return this._token1
    }

    set token1(value: LpToken) {
        this._token1 = value
    }

    toJSON(): object {
        return {
            isTypeOf: this.isTypeOf,
            token0: this.token0.toJSON(),
            token1: this.token1.toJSON(),
        }
    }
}
