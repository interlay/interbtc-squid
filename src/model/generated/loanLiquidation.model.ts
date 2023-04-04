import {BigDecimal} from "@subsquid/big-decimal"
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

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    amountRepaidHuman!: BigDecimal

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    amountRepaidToken!: Currency

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    seizedCollateral!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    seizedCollateralHuman!: BigDecimal

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    seizedCollateralToken!: Currency

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    liquidationCost!: bigint

    @Column_("numeric", {transformer: marshal.bigdecimalTransformer, nullable: false})
    liquidationCostHuman!: BigDecimal

    @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => obj == null ? undefined : fromJsonCurrency(obj)}, nullable: false})
    liquidationCostToken!: Currency

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
