import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./_token"
import {Height} from "./height.model"

@Entity_()
export class Transfer {
  constructor(props?: Partial<Transfer>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("varchar", {length: 4, nullable: false})
  token!: Token

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Index_()
  @Column_("text", {nullable: false})
  from!: string

  @Index_()
  @Column_("text", {nullable: false})
  to!: string

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  height!: Height

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
