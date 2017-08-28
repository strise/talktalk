// @flow

import Dispatcher from '../../../src/dispatcher'
import Handler from '../../../src/handler'
import { cliReplier, startCliBot } from '../../utils'
import type { CliMessage, CliReply } from '../../utils'

class QualityJudgeHandler extends Handler {
  async handleJump (context: { number: number }) {
    await this.sendMessage({message: `${context.number}... That's not very original`})
    this.jumpTo(IntroHandler, {})
  }
}

class IntroHandler extends Handler {
  async handleFirstMessage (): Promise<*> {
    await this.sendMessage({message: 'Hi'})
    await this.sendMessage({message: 'Please give me a number between 0 and 100!'})
    return {}
  }

  async handleSessionMessage (message: CliMessage): Promise<*> {
    const number = parseInt(message.message)
    if (isNaN(number) || number < 0 || number > 100) {
      await this.sendMessage({message: 'That is not a valid number...'})
      await this.sendMessage({message: 'Try again!'})
      return {}
    }
    this.jumpTo(QualityJudgeHandler, {number})
  }

  async handleJump (): Promise<*> {
    this.sendMessage({message: 'Try again!'})
    return {}
  }
}

const dispatcher: Dispatcher<CliMessage, CliReply> = new Dispatcher(cliReplier)

dispatcher.registerHandler(IntroHandler)

startCliBot(dispatcher)
