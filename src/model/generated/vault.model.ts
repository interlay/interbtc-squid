import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Currency, fromJsonCurrency} from "./_currency"
import {CollateralThreshold} from "./_collateralThreshold"
import {Height} from "./height.model"

@Entity_()
export class Vault {
    constructor(props?: Partial<Vault>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    accountId!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    collateralToken!: Currency

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    collateralAmount!: bigint

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    wrappedToken!: Currency

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    pendingWrappedAmount!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    wrappedAmount!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: true})
    collateralization!: BigDecimal | undefined | null

    @Column_("bool", {nullable: true})
    statusIssuing!: boolean | undefined | null

    @Column_("varchar", {length: 16, nullable: false})
    statusCollateral!: CollateralThreshold

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    registrationBlock!: Height

    @Column_("timestamp with time zone", {nullable: false})
    registrationTimestamp!: Date

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    lastActivity!: Height | undefined | null
}
