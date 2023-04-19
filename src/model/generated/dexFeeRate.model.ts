import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {PoolType} from "./_poolType"

@Entity_()
export class DexFeeRate {
    constructor(props?: Partial<DexFeeRate>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    poolId!: string

    @Column_("varchar", {length: 8, nullable: false})
    poolType!: PoolType

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    feeRate!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    adminFeeRate!: bigint | undefined | null
}
