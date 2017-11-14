// @flow

import type { BaseMessage, Postback } from './dispatcher'
import Dispatcher from './dispatcher'
import EventEmitter from 'events'

class Convo<Message: BaseMessage, Reply: {}> {
  sender: string
  tester: Tester<Message, Reply>
  replies: Reply[] = []

  constructor (tester: Tester<Message, Reply>, sender: string) {
    this.tester = tester
    this.sender = sender
    this.tester._messageEvents.on(this.sender, reply => {
      this.replies = this.replies.concat(reply)
    })
  }

  async sendMessage (message: $Diff<Message, BaseMessage>): Promise<*> {
    const newBase: BaseMessage = {type: 'message', sender: this.sender}
    // $FlowFixMe This is correct type
    const newMessage: Message = {...message, ...newBase}
    await this.tester.dispatcher.handleMessage(newMessage)
  }

  _takeReply (): ?Reply {
    if (!this.replies.length) {
      return null
    }
    const reply = this.replies[0]
    this.replies = this.replies.slice(1)
    return reply
  }

  async expectReply (): Promise<Reply> {
    const reply = this._takeReply()
    if (reply) {
      return reply
    }
    return new Promise((resolve, reject) => {
      this.tester._messageEvents.once(this.sender, () => {
        const reply = this._takeReply()
        if (!reply) {
          return reject(new Error('This should never happen'))
        }
        resolve(reply)
      })
    })
  }
}

export default class Tester<Message: BaseMessage, Reply: {}> {
  _messageEvents = new EventEmitter()
  sender: (r: Reply, m: Message | Postback<*>) => Promise<*> = async (r: Reply, m: *) => this._messageEvents.emit(m.sender, r)
  dispatcher: Dispatcher<Message, Reply> = new Dispatcher(this.sender)
  senderIdGenerator: () => string

  constructor (senderIdGenerator: () => string = () => `${Math.floor(Math.random() * 10 ^ 32)}`) {
    this.senderIdGenerator = senderIdGenerator
  }

  startConversation (sender?: string = this.senderIdGenerator()): Convo<Message, Reply> {
    return new Convo(this, sender)
  }
}
