import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToOne as OneToOne_} from "typeorm"
import * as marshal from "../marshal"
import {IssueRequest} from "./issueRequest"
import {IssuePayment} from "./issuePayment.model"
import {IssueStatus} from "./issueStatus"
import {IssueExecution} from "./issueExecution.model"
import {IssueCancellation} from "./issueCancellation.model"
import {Refund} from "./refund.model"

@Entity_()
export class Issue {
  constructor(props?: Partial<Issue>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new IssueRequest(undefined, marshal.nonNull(obj))}, nullable: false})
  request!: IssueRequest

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  griefingCollateral!: bigint

  @Column_("text", {nullable: false})
  userParachainAddress!: string

  @Column_("text", {nullable: false})
  vaultWalletPubkey!: string

  @Column_("text", {nullable: false})
  vaultBackingAddress!: string

  @Column_("text", {nullable: false})
  vaultParachainAddress!: string

  @OneToOne_(() => IssuePayment)
  backingPayment!: IssuePayment | undefined | null

  @Column_("varchar", {length: 15, nullable: true})
  status!: IssueStatus | undefined | null

  @OneToOne_(() => IssueExecution)
  execution!: IssueExecution | undefined | null

  @OneToOne_(() => IssueCancellation)
  cancellation!: IssueCancellation | undefined | null

  @OneToOne_(() => Refund)
  refund!: Refund | undefined | null
}
