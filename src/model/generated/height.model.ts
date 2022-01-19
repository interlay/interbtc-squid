import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

/**
 * Mapping of parachain raw/absolute blocks to parachain active blocks
 */
@Entity_()
export class Height {
  constructor(props?: Partial<Height>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  /**
   * Should be equal to the absolute value, for determinism
   */
  @Column_("integer", {nullable: false})
  absolute!: number

  @Column_("integer", {nullable: false})
  active!: number
}
