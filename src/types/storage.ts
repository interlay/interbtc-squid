import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result, Option} from './support'
import * as v1 from './v1'
import * as v3 from './v3'
import * as v6 from './v6'
import * as v15 from './v15'
import * as v17 from './v17'
import * as v1020000 from './v1020000'
import * as v1021000 from './v1021000'

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

export class VaultRegistryLiquidationCollateralThresholdStorage {
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
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === '77f4ab3c80fb3096696f01567869646c1b7f4c2bf86a9cf16a166aba7c80e558'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV1(key: v1.CurrencyId): Promise<bigint | undefined> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV1(keys: v1.CurrencyId[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1(): Promise<(bigint)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV3() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === 'f58aaaac8cc3e7edfedd81619d660e83aec1ac0adc56efd2b1cad773fe72cc51'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV3(key: v3.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV3)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV3(keys: v3.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV3(): Promise<(bigint)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV6() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === '667822dd26c0fa66a43f655546cc93fa3972ecfe04074ea8896306bb516204d9'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV6(key: v6.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV6)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV6(keys: v6.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV6(): Promise<(bigint)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV15() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === 'ad987919949bcb70bda67a46452d8aee65d35edc778af9ee626f2c29f0ead854'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV15(key: v15.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV15)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV15(keys: v15.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV15(): Promise<(bigint)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV17() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === 'e5102c1c32c0fa240ad0896edefd085949467af35356bf67940e4cd1b6bd6487'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV17(key: v17.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV17)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV17(keys: v17.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV17(): Promise<(bigint)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV1020000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === 'a45102c9f7fbf32b53629854fd2cada14c69e181bf36a9db7ead04d95541bbc7'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV1020000(key: v1020000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1020000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV1020000(keys: v1020000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1020000(): Promise<(bigint)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') === '65ed8331e8c49890906518854e8455bd27acfc33f13a2809a6613268186e6cf3'
    }

    /**
     *  Determines the lower bound for the collateral rate in issued tokens. If a Vault’s
     *  collateral rate drops below this, automatic liquidation (forced Redeem) is triggered.
     */
    async getAsV1021000(key: v1021000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', key)
    }

    async getManyAsV1021000(keys: v1021000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(bigint)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'LiquidationCollateralThreshold')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'LiquidationCollateralThreshold') != null
    }
}

export class VaultRegistryPremiumRedeemThresholdStorage {
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
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === '77f4ab3c80fb3096696f01567869646c1b7f4c2bf86a9cf16a166aba7c80e558'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1(key: v1.CurrencyId): Promise<bigint | undefined> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV1(keys: v1.CurrencyId[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV1(): Promise<(bigint)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV3() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === 'f58aaaac8cc3e7edfedd81619d660e83aec1ac0adc56efd2b1cad773fe72cc51'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV3(key: v3.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV3)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV3(keys: v3.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV3(): Promise<(bigint)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV6() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === '667822dd26c0fa66a43f655546cc93fa3972ecfe04074ea8896306bb516204d9'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV6(key: v6.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV6)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV6(keys: v6.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV6(): Promise<(bigint)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV15() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === 'ad987919949bcb70bda67a46452d8aee65d35edc778af9ee626f2c29f0ead854'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV15(key: v15.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV15)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV15(keys: v15.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV15(): Promise<(bigint)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV17() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === 'e5102c1c32c0fa240ad0896edefd085949467af35356bf67940e4cd1b6bd6487'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV17(key: v17.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV17)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV17(keys: v17.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV17(): Promise<(bigint)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1020000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === 'a45102c9f7fbf32b53629854fd2cada14c69e181bf36a9db7ead04d95541bbc7'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1020000(key: v1020000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1020000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV1020000(keys: v1020000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV1020000(): Promise<(bigint)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') === '65ed8331e8c49890906518854e8455bd27acfc33f13a2809a6613268186e6cf3'
    }

    /**
     *  Determines the rate for the collateral rate of Vaults, at which users receive a premium,
     *  allocated from the Vault's collateral, when performing a redeem with this Vault. This
     *  threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1021000(key: v1021000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', key)
    }

    async getManyAsV1021000(keys: v1021000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(bigint)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'PremiumRedeemThreshold')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'PremiumRedeemThreshold') != null
    }
}

export class VaultRegistrySecureCollateralThresholdStorage {
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
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === '77f4ab3c80fb3096696f01567869646c1b7f4c2bf86a9cf16a166aba7c80e558'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1(key: v1.CurrencyId): Promise<bigint | undefined> {
        assert(this.isV1)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV1(keys: v1.CurrencyId[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1(): Promise<(bigint)[]> {
        assert(this.isV1)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV3() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === 'f58aaaac8cc3e7edfedd81619d660e83aec1ac0adc56efd2b1cad773fe72cc51'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV3(key: v3.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV3)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV3(keys: v3.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV3(): Promise<(bigint)[]> {
        assert(this.isV3)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV6() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === '667822dd26c0fa66a43f655546cc93fa3972ecfe04074ea8896306bb516204d9'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV6(key: v6.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV6)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV6(keys: v6.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV6(): Promise<(bigint)[]> {
        assert(this.isV6)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV15() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === 'ad987919949bcb70bda67a46452d8aee65d35edc778af9ee626f2c29f0ead854'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV15(key: v15.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV15)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV15(keys: v15.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV15(): Promise<(bigint)[]> {
        assert(this.isV15)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV17() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === 'e5102c1c32c0fa240ad0896edefd085949467af35356bf67940e4cd1b6bd6487'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV17(key: v17.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV17)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV17(keys: v17.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV17(): Promise<(bigint)[]> {
        assert(this.isV17)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1020000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === 'a45102c9f7fbf32b53629854fd2cada14c69e181bf36a9db7ead04d95541bbc7'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1020000(key: v1020000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1020000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV1020000(keys: v1020000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1020000(): Promise<(bigint)[]> {
        assert(this.isV1020000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    get isV1021000() {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') === '65ed8331e8c49890906518854e8455bd27acfc33f13a2809a6613268186e6cf3'
    }

    /**
     *  Determines the over-collateralization rate for collateral locked by Vaults, necessary for
     *  wrapped tokens. This threshold should be greater than the LiquidationCollateralThreshold.
     */
    async getAsV1021000(key: v1021000.VaultCurrencyPair): Promise<bigint | undefined> {
        assert(this.isV1021000)
        return this._chain.getStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', key)
    }

    async getManyAsV1021000(keys: v1021000.VaultCurrencyPair[]): Promise<(bigint | undefined)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold', keys.map(k => [k]))
    }

    async getAllAsV1021000(): Promise<(bigint)[]> {
        assert(this.isV1021000)
        return this._chain.queryStorage(this.blockHash, 'VaultRegistry', 'SecureCollateralThreshold')
    }

    /**
     * Checks whether the storage item is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getStorageItemTypeHash('VaultRegistry', 'SecureCollateralThreshold') != null
    }
}
