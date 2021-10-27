import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class VaultRegistration {
  constructor(props?: Partial<VaultRegistration>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  block!: number

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date
}
