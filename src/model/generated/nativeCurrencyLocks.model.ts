import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Height} from "./height.model"
import {NativeCurrencyLockType} from "./_nativeCurrencyLockType"
import {Token} from "./_token"

@Entity_()
export class NativeCurrencyLocks {
    constructor(props?: Partial<NativeCurrencyLocks>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    height!: Height

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Index_()
    @Column_("varchar", {length: 10, nullable: false})
    type!: NativeCurrencyLockType

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountHuman!: BigDecimal

    @Column_("text", {nullable: false})
    accountId!: string

    @Column_("text", {nullable: false})
    symbol!: string

    @Column_("varchar", {length: 4, nullable: false})
    token!: Token
}
