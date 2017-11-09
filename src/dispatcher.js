// @flow
import Debug from 'debug'
import type Handler from './handler'
import type Storage from './storage/storage'
import MemoryStorage from './storage/memory'

const debug = Debug('talktalk:dispather')

type Session = {|
  handler: string,
  context: ?{}
|}

export type BaseMessage = { type: 'message', intent?: string, sender: string }
export type Postback<C: {}> = { type: 'postback', context: C, target: string, sender: string }

export default class Dispatcher<Message: BaseMessage, Reply: {}> {
  handlers: Array<Class<Handler<*, *, Message, Reply>>> = []
  handlersMap: { [string]: Class<Handler<*, *, Message, Reply>> } = {}
  store: Storage<Session>
  sender: (r: Reply, m: Message | Postback<*>) => Promise<*>

  constructor (sender: (r: Reply, m: Message | Postback<*>) => Promise<*>, store: Storage<Session> = new MemoryStorage()) {
    this.store = store
    this.sender = sender
  }

  buildPostback<JC: {}> (_Handler: Class<Handler<*, JC, *, *>>, context: JC, sender: string): Postback<JC> {
    return {type: 'postback', context, target: _Handler.name, sender}
  }

  handleMessages (messages: Array<Message | Postback<*>>): Promise<*> {
    debug('Handling messages', messages)
    return Promise.all(messages.map(message => this.handleMessage(message)))
  }

  async handleMessage (message: Message | Postback<*>): Promise<*> {
    switch (message.type) {
      case 'postback':
        return this._handlePostback(message)
      case 'message':
        return this._handleMessage(message)
      default:
        throw new Error('Message type not supported')
    }
  }

  _saveOrClearSession (userId: string, session: Session): Promise<*> {
    if (!session.context) {
      debug('No context. Clearing session', session)
      return this.store.clearEntry(userId)
    }
    debug('Saving session')
    return this.store.setEntry(userId, session)
  }

  _fetchSession (userId: string) {
    return this.store.getEntry(userId)
  }

  async _handleMessage (message: Message): Promise<*> {
    debug('Handling message')
    const session = await this._fetchSession(message.sender)
    debug('... message', message)
    if (!session) {
      debug('Found no session')
      return this._handleFirstMessage(message, this.handlers.slice(0))
    }
    debug('Found session', session)
    return this._handleSessionMessage(message, session)
  }

  async _handlePostback (postback: Postback<*>): Promise<*> {
    const _Handler = this.handlersMap[postback.target]
    if (!_Handler) {
      return
    }
    const handler = new _Handler((reply) => this.sender(reply, postback), postback.sender)
    debug('Handling postback with handler id', postback.target, 'and payload', postback.context)
    const context = await handler.handleJump(postback.context)
    return this._messagePostProcess(handler, context, postback)
  }

  async _handleFirstMessage (message: Message, handlers: Class<Handler<*, *, Message, Reply>>[]) {
    if (!handlers.length) {
      debug('Found no handler...')
      throw new Error('No handler found')
    }
    const _Handler = handlers[0]
    debug('Trying', _Handler.name)
    const handler = new _Handler((reply) => this.sender(reply, message), message.sender)
    const context = await handler.handleMessage(message)
    debug('Finished message, got context', context)
    return this._messagePostProcess(handler, context, message, handlers.slice(1))
  }

  async _handleSessionMessage (message: Message, {handler: handlerId, context}: Session) {
    const _Handler = this.handlersMap[handlerId]
    const handler = new _Handler((reply) => this.sender(reply, message), message.sender)
    debug('Trying', handlerId)
    const newContext = await handler.handleMessage(message, context)
    debug('Finished handling message', newContext)
    return this._messagePostProcess(handler, newContext, message, this.handlers.slice(0))
  }

  async _messagePostProcess<C: {}> (handler: Handler<C, *, Message, Reply>, context: ?C, message: Message | Postback<*>, handlers?: Class<Handler<C, *, Message, Reply>>[] = []) {
    const jumber = handler.jumper
    if (jumber) {
      debug('Jumping...')
      const {handler: newHandler, context: newContext} = await jumber()
      debug('... to ', newHandler.constructor.name, 'with context', newContext)
      return this._messagePostProcess(newHandler, newContext, message, this.handlers)
    }
    if (handler.hasSentReply) {
      await this._saveOrClearSession(message.sender, {handler: handler.constructor.name, context})
      return
    }
    if (message.type === 'postback') {
      return
    }
    debug('Handler should not send slicing ')
    return this._handleFirstMessage(message, handlers)
  }

  registerHandler (Handler: Class<Handler<*, *, Message, Reply>>): void {
    this.handlers.push(Handler)
    this.handlersMap[Handler.name] = Handler
  }
}
