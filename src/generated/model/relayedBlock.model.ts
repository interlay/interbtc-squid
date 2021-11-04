import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Height} from "./height.model"

/**
 * BTC block stored by BTCRelay
 */
@Entity_()
export class RelayedBlock {
  constructor(props?: Partial<RelayedBlock>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Height, {nullable: false})
  relayedAtHeight!: Height

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("text", {nullable: false})
  blockHash!: string

  @Column_("integer", {nullable: false})
  backingHeight!: number

  @Column_("text", {nullable: true})
  relayer!: string | undefined | null
}
