import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToOne as OneToOne_} from "typeorm"
import * as marshal from "../marshal"
import {RedeemRequest} from "./redeemRequest"
import {RedeemPayment} from "./redeemPayment.model"
import {RedeemStatus} from "./redeemStatus"
import {RedeemExecution} from "./redeemExecution.model"
import {RedeemCancellation} from "./redeemCancellation.model"

@Entity_()
export class Redeem {
  constructor(props?: Partial<Redeem>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new RedeemRequest(undefined, marshal.nonNull(obj))}, nullable: false})
  request!: RedeemRequest

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  bridgeFee!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  collateralPremium!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  btcTransferFee!: bigint

  @Column_("text", {nullable: false})
  userParachainAddress!: string

  @Column_("text", {nullable: false})
  userBackingAddress!: string

  @Column_("text", {nullable: false})
  vaultParachainAddress!: string

  @OneToOne_(() => RedeemPayment)
  backingPayment!: RedeemPayment | undefined | null

  @Column_("varchar", {length: 10, nullable: true})
  status!: RedeemStatus | undefined | null

  @OneToOne_(() => RedeemExecution)
  execution!: RedeemExecution | undefined | null

  @OneToOne_(() => RedeemCancellation)
  cancellation!: RedeemCancellation | undefined | null
}
