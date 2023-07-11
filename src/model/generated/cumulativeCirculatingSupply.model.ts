import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Height} from "./height.model"
import {Currency, fromJsonCurrency} from "./_currency"

@Entity_()
export class CumulativeCirculatingSupply {
    constructor(props?: Partial<CumulativeCirculatingSupply>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    height!: Height

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    tillTimestamp!: Date

    @Column_("text", {nullable: false})
    symbol!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountCirculating!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountCirculatingHuman!: BigDecimal

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalSupply!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    totalSupplyHuman!: BigDecimal

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountLocked!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountLockedHuman!: BigDecimal

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountReserved!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountReservedHuman!: BigDecimal

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountSystemAccounts!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountSystemAccountsHuman!: BigDecimal

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    currency!: Currency
}
