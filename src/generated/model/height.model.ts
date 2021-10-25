import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "../marshal"

@Entity_()
export class Height {
  constructor(props?: Partial<Height>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  absolute!: bigint

  @Column_("integer", {nullable: false})
  active!: number
}
