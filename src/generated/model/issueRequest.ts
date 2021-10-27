import assert from "assert"
import * as marshal from "../marshal"
import {Height} from "./height.model"

/**
 * Request of an issue
 */
export class IssueRequest {
  private _requestedAmountWrapped!: bigint
  private _height!: string
  private _timestamp!: Date

  constructor(props?: Partial<Omit<IssueRequest, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._requestedAmountWrapped = marshal.bigint.fromJSON(json.requestedAmountWrapped)
      this._height = marshal.string.fromJSON(json.height)
      this._timestamp = marshal.datetime.fromJSON(json.timestamp)
    }
  }

  get requestedAmountWrapped(): bigint {
    assert(this._requestedAmountWrapped != null, 'uninitialized access')
    return this._requestedAmountWrapped
  }

  set requestedAmountWrapped(value: bigint) {
    this._requestedAmountWrapped = value
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
      requestedAmountWrapped: marshal.bigint.toJSON(this.requestedAmountWrapped),
      height: this.height,
      timestamp: marshal.datetime.toJSON(this.timestamp),
    }
  }
}
