import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToOne as OneToOne_, Index as Index_, JoinColumn as JoinColumn_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Issue} from "./issue.model"
import {Height} from "./height.model"

@Entity_()
export class IssueAmountChange {
  constructor(props?: Partial<IssueAmountChange>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_({unique: true})
  @OneToOne_(() => Issue, {nullable: false})
  @JoinColumn_()
  issue!: Issue

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amountWrapped!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  bridgeFeeWrapped!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  confiscatedGriefingCollateral!: bigint

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  height!: Height
}
