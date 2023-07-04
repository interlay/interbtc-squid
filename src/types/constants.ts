import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result, Option} from './support'
import * as v10 from './v10'
import * as v15 from './v15'
import * as v17 from './v17'
import * as v1020000 from './v1020000'
import * as v1021000 from './v1021000'

export class CurrencyGetNativeCurrencyIdConstant {
    private readonly _chain: Chain

    constructor(ctx: ChainContext) {
        this._chain = ctx._chain
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get isV10() {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') === '9b91e32482c9d59095f0f4dd534460b1e5f49e3ee4215dd53acf232392dd25c1'
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get asV10(): v10.CurrencyId {
        assert(this.isV10)
        return this._chain.getConstant('Currency', 'GetNativeCurrencyId')
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get isV15() {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') === '30e7614142103a3c642499cd55af6ac2eca1d8b0d8e12703738bb24ddf983a1f'
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get asV15(): v15.CurrencyId {
        assert(this.isV15)
        return this._chain.getConstant('Currency', 'GetNativeCurrencyId')
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get isV17() {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') === 'f5e8066841f09e6a9b4738b8df911e7611ef2e0db156aabed3bbc6998830acbc'
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get asV17(): v17.CurrencyId {
        assert(this.isV17)
        return this._chain.getConstant('Currency', 'GetNativeCurrencyId')
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get isV1020000() {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') === '7568f999e28f7421787bb9c91ad7b8b1b76472df631fe9786fdd36768466810d'
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get asV1020000(): v1020000.CurrencyId {
        assert(this.isV1020000)
        return this._chain.getConstant('Currency', 'GetNativeCurrencyId')
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get isV1021000() {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') === '00a3f785cee4e45e0ae1035b12de3a7328975601e5307eaa4727dc726768bcce'
    }

    /**
     *  Native currency e.g. INTR/KINT
     */
    get asV1021000(): v1021000.CurrencyId {
        assert(this.isV1021000)
        return this._chain.getConstant('Currency', 'GetNativeCurrencyId')
    }

    /**
     * Checks whether the constant is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getConstantTypeHash('Currency', 'GetNativeCurrencyId') != null
    }
}
