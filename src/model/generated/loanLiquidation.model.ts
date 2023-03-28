import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {Currency, fromJsonCurrency} from "./_currency"

@Entity_()
export class LoanLiquidation {
    constructor(props?: Partial<LoanLiquidation>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amountRepaid!: bigint

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    amountRepaidToken!: Currency

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    seizedCollateral!: bigint

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    seizedCollateralToken!: Currency

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    liquidationCostBtc!: number

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    liquidationCostUsdt!: number

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
