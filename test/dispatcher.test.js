// @flow

import { TalkTalkTest } from './utils'
import Handler from '../src/handler'
import type { BaseMessage } from '../src/dispatcher'
import assert from 'assert'

type Message = BaseMessage & {message: string}
type Reply = {message: string}
const tester : TalkTalkTest<Message, Reply> = new TalkTalkTest()

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
