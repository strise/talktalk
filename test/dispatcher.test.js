// @flow

import Handler from '../src/handler'
import type { BaseMessage } from '../src/dispatcher'
import assert from 'assert'
import Tester from '../src/tester'

type Message = BaseMessage & {message: string}
type Reply = {message: string}
const tester : Tester<Message, Reply> = new Tester()

class HelloWorldHandler extends Handler {

  async handleFirstMessage () {
    this.sendMessage({message: 'Hello world'})
  }
}

tester.dispatcher.registerHandler(HelloWorldHandler)

describe('dispatncher', () => {
  it('should send hello world', async () => {
    const convo = tester.startConversation()
    await convo.sendMessage({message: 'Hi'})
    const reply = await convo.expectReply()
    assert(reply.message === 'Hello world')
  })
})
