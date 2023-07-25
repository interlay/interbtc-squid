import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result, Option} from './support'
import * as v1 from './v1'
import * as v6 from './v6'
import * as v15 from './v15'
import * as v17 from './v17'
import * as v1020000 from './v1020000'
import * as v1021000 from './v1021000'

export class DexGeneralPairStatusesStorage {
    private readonly _chain: Chain
    private readonly blockHash: string

    constructor(ctx: BlockContext)
    constructor(ctx: ChainContext, block: Block)
    constructor(ctx: BlockContext, block?: Block) {
        block = block || ctx.block
        this.blockHash = block.hash
        this._chain = ctx._chain
    }

    /**
     *  (T::AssetId, T::AssetId) -> PairStatus
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('DexGeneral', 'PairStatuses') === '76a1869bbdaab66d28110f9e64b6a17291d90f48aa261faa9ef287897775caa1'
    }

    /**
     *  (T::AssetId, T::AssetId) -> PairStatus
     */
    async getAsV1021000(key: [v1021000.CurrencyId, v1021000.CurrencyId]): Promise<v1021000.PairStatus> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'DexGeneral', 'PairStatuses', key)
    }

    async getManyAsV1021000(keys: [v1021000.CurrencyId, v1021000.CurrencyId][]): Promise<(v1021000.PairStatus)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'DexGeneral', 'PairStatuses', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(v1021000.PairStatus)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'DexGeneral', 'PairStatuses')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('DexGeneral', 'PairStatuses') != null
    }
}

export class DexStablePoolsStorage {
    private readonly _chain: Chain
    private readonly blockHash: string

    constructor(ctx: BlockContext)
    constructor(ctx: ChainContext, block: Block)
    constructor(ctx: BlockContext, block?: Block) {
        block = block || ctx.block
        this.blockHash = block.hash
        this._chain = ctx._chain
    }

    /**
     *  Info of a pool.
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('DexStable', 'Pools') === '589bc6643ae522e9f672bbb153dcc85f9ed48dd356b43697ce45ce589424599a'
    }

    /**
     *  Info of a pool.
     */
    async getAsV1021000(key: number): Promise<v1021000.Pool | undefined> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'DexStable', 'Pools', key)
    }

    async getManyAsV1021000(keys: number[]): Promise<(v1021000.Pool | undefined)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'DexStable', 'Pools', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(v1021000.Pool)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'DexStable', 'Pools')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('DexStable', 'Pools') != null
    }
}

export class IssueIssuePeriodStorage {
    private readonly _chain: Chain
    private readonly blockHash: string

    constructor(ctx: BlockContext)
    constructor(ctx: ChainContext, block: Block)
    constructor(ctx: BlockContext, block?: Block) {
        block = block || ctx.block
        this.blockHash = block.hash
        this._chain = ctx._chain
    }

    /**
     *  The time difference in number of blocks between an issue request is created
     *  and required completion time by a user. The issue period has an upper limit
     *  to prevent griefing of vault collateral.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('Issue', 'IssuePeriod') === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
    }

    /**
     *  The time difference in number of blocks between an issue request is created
     *  and required completion time by a user. The issue period has an upper limit
     *  to prevent griefing of vault collateral.
     */
    async getAsV1(): Promise<number> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'Issue', 'IssuePeriod')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('Issue', 'IssuePeriod') != null
    }
}

export class RedeemRedeemPeriodStorage {
    private readonly _chain: Chain
    private readonly blockHash: string

    constructor(ctx: BlockContext)
    constructor(ctx: ChainContext, block: Block)
    constructor(ctx: BlockContext, block?: Block) {
        block = block || ctx.block
        this.blockHash = block.hash
        this._chain = ctx._chain
    }

    /**
     *  The time difference in number of blocks between a redeem request is created and required completion time by a
     *  vault. The redeem period has an upper limit to ensure the user gets their BTC in time and to potentially
     *  punish a vault for inactivity or stealing BTC.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('Redeem', 'RedeemPeriod') === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
    }

    /**
     *  The time difference in number of blocks between a redeem request is created and required completion time by a
     *  vault. The redeem period has an upper limit to ensure the user gets their BTC in time and to potentially
     *  punish a vault for inactivity or stealing BTC.
     */
    async getAsV1(): Promise<number> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'Redeem', 'RedeemPeriod')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('Redeem', 'RedeemPeriod') != null
    }
}

export class TokensTotalIssuanceStorage {
    private readonly _chain: Chain
    private readonly blockHash: string

    constructor(ctx: BlockContext)
    constructor(ctx: ChainContext, block: Block)
    constructor(ctx: BlockContext, block?: Block) {
        block = block || ctx.block
        this.blockHash = block.hash
        this._chain = ctx._chain
    }

    /**
     *  The total issuance of a token type.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === '157d206012d22a8c2326905cf8d5b8033f5f54ca4ec10510c456273a838eccad'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV1(key: v1.CurrencyId): Promise<bigint> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV1(keys: v1.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV1(): Promise<(bigint)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     *  The total issuance of a token type.
     */
    get isV6() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === '202e145ca79e50acddde5723e9539b3161c0527d5e8504619e0ab044a49473bb'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV6(key: v6.CurrencyId): Promise<bigint> {
        assert(this.isV6)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV6(keys: v6.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV6(): Promise<(bigint)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     *  The total issuance of a token type.
     */
    get isV15() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === '1fc54356054e122a846385a4972244f728d7281d64896b8c4c7d826301a6a47a'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV15(key: v15.CurrencyId): Promise<bigint> {
        assert(this.isV15)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV15(keys: v15.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV15(): Promise<(bigint)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     *  The total issuance of a token type.
     */
    get isV17() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === 'b634c990abe839aa43a5a2354d0e8c056125817c0823a4ca30f2658ceb7373c9'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV17(key: v17.CurrencyId): Promise<bigint> {
        assert(this.isV17)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV17(keys: v17.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV17(): Promise<(bigint)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     *  The total issuance of a token type.
     */
    get isV1020000() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === '6e518188c38ce30fff4719c24e7d91f268daa79867a8999c4a814e06db51dcf2'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV1020000(key: v1020000.CurrencyId): Promise<bigint> {
        assert(this.isV1020000)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV1020000(keys: v1020000.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV1020000(): Promise<(bigint)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     *  The total issuance of a token type.
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') === 'e4a8205ba5bd00bf77e21d23338fe02812c96c9d4c5c8f52854a53fc0d9508cb'
    }

    /**
     *  The total issuance of a token type.
     */
    async getAsV1021000(key: v1021000.CurrencyId): Promise<bigint> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'Tokens', 'TotalIssuance', key)
    }

    async getManyAsV1021000(keys: v1021000.CurrencyId[]): Promise<(bigint)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(bigint)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'Tokens', 'TotalIssuance')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('Tokens', 'TotalIssuance') != null
    }
}
