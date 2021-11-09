import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class OracleUpdate {
  constructor(props?: Partial<OracleUpdate>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  oracleId!: string

  @Column_("text", {nullable: false})
  key!: string

  @Column_("text", {nullable: false})
  value!: string
}
