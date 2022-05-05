import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import {Token} from "./_token"
import {Height} from "./height.model"

@Entity_()
export class Vault {
  constructor(props?: Partial<Vault>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: false})
  accountId!: string

  @Column_("varchar", {length: 4, nullable: false})
  collateralToken!: Token

  @Column_("varchar", {length: 4, nullable: false})
  wrappedToken!: Token

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  registrationBlock!: Height

  @Column_("timestamp with time zone", {nullable: false})
  registrationTimestamp!: Date

  @Index_()
  @ManyToOne_(() => Height, {nullable: true})
  lastActivity!: Height | undefined | null
}
