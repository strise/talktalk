// @flow
import type { BaseMessage } from './dispatcher'

export default class Handler<Context: {}, RedirectContext: {}, PostbackContext: {}, Message: BaseMessage, Reply: {}> {
  hasSentMessage: boolean = false
  redirector: ?(() => Promise<{ handler: Handler<*, *, *, Message, Reply>, context: * }>)
  intent: ?string
  _done: boolean = false
  sender: (r: Reply) => Promise<*>

  constructor (sender: (r: Reply) => Promise<*>) {
    this.sender = sender
  }

  async handleMessage (message: Message, context: ?Context): Promise<?Context> {
    if (!context) {
      if (this.intent && this.intent !== message.intent) {
        return null
      }
      return this.handleFirstMessage(message)
    }
    return this.handleSessionMessage(message, context)
  }

  async handleFirstMessage (message: Message): Promise<?Context> {

  }

  async handleSessionMessage (message: Message, context: Context): Promise<?Context> {

  }

  async handlePostback (postback: PostbackContext): Promise<?Context> {

  }

  async handleRedirect (context: RedirectContext): Promise<?Context> {

  }

  _markMessageSent (): void {
    if (this._done) {
      throw new Error('Last message has already been sent.')
    }
    this.hasSentMessage = true
  }

  async sendMessage (reply: Reply): Promise<*> {
    this._markMessageSent()
    await this.sender(reply)
  }

  redirectTo<C: {}, RC: {}> (_Handler: Class<Handler<C, RC, PostbackContext, Message, Reply>>, context: RC) {
    this.redirector = async () => {
      const handler = new _Handler(this.sender)
      const newContext: ?C = await handler.handleRedirect(context)
      return {handler, context: newContext}
    }
  }
}
