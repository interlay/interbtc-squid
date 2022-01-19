import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Height} from "./height.model"
import {OracleUpdateType} from "./_oracleUpdateType"

@Entity_()
export class OracleUpdate {
  constructor(props?: Partial<OracleUpdate>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  height!: Height

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("text", {nullable: false})
  oracleId!: string

  @Column_("varchar", {length: 13, nullable: false})
  type!: OracleUpdateType

  @Column_("text", {nullable: true})
  typeKey!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  updateValue!: bigint
}
