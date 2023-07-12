import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Currency, fromJsonCurrency} from "./_currency"
import {Height} from "./height.model"

@Entity_()
export class TokenLock {
    constructor(props?: Partial<TokenLock>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    account!: string

    @Column_("text", {nullable: false})
    lockId!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    currency!: Currency

    @Column_("text", {nullable: false})
    symbol!: string

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    heightSet!: Height

    @Column_("timestamp with time zone", {nullable: false})
    timestampSet!: Date
}
