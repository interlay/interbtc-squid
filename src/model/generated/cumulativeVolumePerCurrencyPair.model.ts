import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {VolumeType} from "./_volumeType"
import {Token} from "./_token"

@Entity_()
export class CumulativeVolumePerCurrencyPair {
  constructor(props?: Partial<CumulativeVolumePerCurrencyPair>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("varchar", {length: 10, nullable: false})
  type!: VolumeType

  @Column_("timestamp with time zone", {nullable: false})
  tillTimestamp!: Date

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Column_("varchar", {length: 8, nullable: true})
  wrappedCurrency!: Token | undefined | null

  @Column_("varchar", {length: 8, nullable: true})
  collateralCurrency!: Token | undefined | null
}
