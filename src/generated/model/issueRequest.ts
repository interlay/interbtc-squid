import assert from "assert"
import * as marshal from "../marshal"
import {Height} from "./height.model"

export class IssueRequest {
  private _amountWrapped!: bigint
  private _height!: string
  private _timestamp!: Date

  constructor(props?: Partial<Omit<IssueRequest, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._amountWrapped = marshal.bigint.fromJSON(json.amountWrapped)
      this._height = marshal.string.fromJSON(json.height)
      this._timestamp = marshal.datetime.fromJSON(json.timestamp)
    }
  }

  get amountWrapped(): bigint {
    assert(this._amountWrapped != null, 'uninitialized access')
    return this._amountWrapped
  }

  set amountWrapped(value: bigint) {
    this._amountWrapped = value
  }

  get height(): string {
    assert(this._height != null, 'uninitialized access')
    return this._height
  }

  set height(value: string) {
    this._height = value
  }

  get timestamp(): Date {
    assert(this._timestamp != null, 'uninitialized access')
    return this._timestamp
  }

  set timestamp(value: Date) {
    this._timestamp = value
  }

  toJSON(): object {
    return {
      amountWrapped: marshal.bigint.toJSON(this.amountWrapped),
      height: this.height,
      timestamp: marshal.datetime.toJSON(this.timestamp),
    }
  }
}
