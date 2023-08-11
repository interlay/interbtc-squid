import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {PoolType} from "./_poolType"
import {Height} from "./height.model"
import {PooledAmount} from "./_pooledAmount"

@Entity_()
export class Swap {
    constructor(props?: Partial<Swap>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("varchar", {length: 8, nullable: false})
    poolType!: PoolType

    @Index_()
    @Column_("text", {nullable: false})
    poolId!: string

    @Column_("text", {nullable: false})
    eventId!: string

    @Index_()
    @ManyToOne_(() => Height, {nullable: true})
    height!: Height

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Index_()
    @Column_("text", {nullable: false})
    fromAccount!: string

    @Index_()
    @Column_("text", {nullable: false})
    toAccount!: string

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new PooledAmount(undefined, obj)}, nullable: false})
    fees!: PooledAmount

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    feeRate!: BigDecimal

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new PooledAmount(undefined, obj)}, nullable: false})
    from!: PooledAmount

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : new PooledAmount(undefined, obj)}, nullable: false})
    to!: PooledAmount
}
