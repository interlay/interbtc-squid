import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class CumulativeSupply {
    constructor(props?: Partial<CumulativeSupply>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalSupply!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    circulatingSupply!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalVestingTokens!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalEscrowTokens!: bigint
}
