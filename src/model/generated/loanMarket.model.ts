import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToOne as OneToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Currency, fromJsonCurrency} from "./_currency"
import {Height} from "./height.model"
import {RateModel, fromJsonRateModel} from "./_rateModel"
import {MarketState} from "./_marketState"
import {LoanMarketActivation} from "./loanMarketActivation.model"

@Entity_()
export class LoanMarket {
    constructor(props?: Partial<LoanMarket>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    token!: Currency

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    height!: Height

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    borrowCap!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    supplyCap!: number

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonRateModel(obj)}, nullable: false})
    rateModel!: RateModel

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    closeFactor!: number

    @Index_({unique: true})
    @Column_("int4", {nullable: false})
    lendTokenId!: number

    @Column_("varchar", {length: 11, nullable: false})
    state!: MarketState

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    reserveFactor!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    collateralFactor!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    liquidateIncentive!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    liquidationThreshold!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    liquidateIncentiveReservedFactor!: number

    @OneToOne_(() => LoanMarketActivation)
    activation!: LoanMarketActivation | undefined | null

    @Column_("text", {nullable: false})
    currencySymbol!: string
}
