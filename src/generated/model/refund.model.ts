import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToOne as OneToOne_, Index as Index_, JoinColumn as JoinColumn_} from "typeorm"
import * as marshal from "../marshal"
import {Issue} from "./issue.model"

/**
 * Refund on issue overpayment
 */
@Entity_()
export class Refund {
  constructor(props?: Partial<Refund>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_({unique: true})
  @OneToOne_(() => Issue, {nullable: false})
  @JoinColumn_()
  issue!: Issue

  @Column_("text", {nullable: false})
  refundBtcAddress!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  refundAmountBTC!: bigint | undefined | null
}
