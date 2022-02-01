import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {RequestType} from "./_requestType"

@Entity_()
export class DailyVolume {
  constructor(props?: Partial<DailyVolume>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("varchar", {length: 6, nullable: false})
  type!: RequestType

  @Column_("timestamp with time zone", {nullable: false})
  fromMidnight!: Date

  /**
   * UTC+0 midnight timestamp of the start of day
   */
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint
}
