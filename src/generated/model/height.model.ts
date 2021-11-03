import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class Height {
  constructor(props?: Partial<Height>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("integer", {nullable: false})
  absolute!: number

  @Column_("integer", {nullable: false})
  active!: number
}
