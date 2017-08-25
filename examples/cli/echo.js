// @flow

import Dispatcher from '../../src/dispatcher'
import Handler from '../../src/handler'
import { cliReplier, startCliBot } from '../utils'
import type { CliMessage, CliReply } from '../utils'

class EchoHandler extends Handler {
  async handleFirstMessage (message: CliMessage): Promise<*> {
    await this.sendMessage({message: message.message})
  }
}

const dispatcher: Dispatcher<CliMessage, CliReply> = new Dispatcher(cliReplier)

dispatcher.registerHandler(EchoHandler)

startCliBot(dispatcher)
