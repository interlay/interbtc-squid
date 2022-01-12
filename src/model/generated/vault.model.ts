import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Height} from "./height.model"

@Entity_()
export class Vault {
  constructor(props?: Partial<Vault>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  registrationBlock!: number

  @Column_("timestamp with time zone", {nullable: false})
  registrationTimestamp!: Date

  @Index_()
  @ManyToOne_(() => Height, {nullable: true})
  lastActivity!: Height | undefined | null
}
