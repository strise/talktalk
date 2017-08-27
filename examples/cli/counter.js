// @flow

import Dispatcher from '../../src/dispatcher'
import Handler from '../../src/handler'
import { startCliBot, cliReplier } from '../utils'
import type { CliMessage, CliReply } from '../utils'

class CounterHandler extends Handler {
  async handleFirstMessage (message: CliMessage): Promise<*> {
    await this.sendMessage({message: 'You have sent 1 message'})
    return {count: 1}
  }

  async handleSessionMessage (message: CliMessage, context: { count: number }): Promise<*> {
    const newCount = context.count + 1
    await this.sendMessage({message: `You have sent ${newCount} messages`})
    return {count: newCount}
  }
}

const dispatcher: Dispatcher<CliMessage, CliReply> = new Dispatcher(cliReplier)

dispatcher.registerHandler(CounterHandler)

startCliBot(dispatcher)
