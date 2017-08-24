// @flow

export default class Storage<S: {}> {
  getEntry(key: string) : Promise<?S> {
    throw new Error('Not implemented')
  }
  setEntry(key: string, value: S) : Promise<?S> {
    throw new Error('Not implemented')
  }
  clearEntry(key: string) : Promise<*> {
    throw new Error('Not implemented')
  }
}
