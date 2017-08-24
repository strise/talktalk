// @flow

import Storage from './storage'

export default class MemoryStorage<S: {}> extends Storage<S> {
  _store: {[string]: S} = {}

  async getEntry (key: string): Promise<?S> {
    return this._store[key]
  }

  async setEntry (key: string, value: S): Promise<*> {
    this._store[key] = value
  }

  async clearEntry (key: string): Promise<*> {
    delete this._store[key]
  }
}
