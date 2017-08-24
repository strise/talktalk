// @flow

import Dispatcher from '../../src/dispatcher'
import Handler from '../../src/handler'
import { startCliBot } from '../utils'
import type { CliMessage, CliReply } from '../utils'

class CounterHandler extends Handler {
  async handleFirstMessage (message: CliMessage): Promise<*> {
    await this.sendMessage({message: 'You have sent 1 message'})
    return {count: 1}
  }
  async handleSessionMessage (message: CliMessage, context: {count: number}): Promise<*> {
    const newCount = context.count + 1
    await this.sendMessage({message: `You have sent ${newCount} messages`})
    return {count: newCount }
  }
}

const dispatcher: Dispatcher<CliMessage, *, CliReply> = new Dispatcher(async (reply: CliReply) => console.log('Bot > ' + reply.message))

dispatcher.registerHandler(CounterHandler)

startCliBot(dispatcher)
