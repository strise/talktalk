// @flow

import Dispatcher from '../../../src/dispatcher'
import Handler from '../../../src/handler'
import { cliReplier, findBestCandidate, startCliWitBot } from '../../utils'
import type { CliReply, WitMessage } from '../../utils'

class GreetingHandler extends Handler {
  intent = 'greeting'

  async handleFirstMessage (msg): Promise<*> {
    this.sendMessage({message: 'Hello there!'})
    return {}
  }

}

function findDuration (message): ?number {
  const durationCandidate = message.entities.duration && findBestCandidate(message.entities.duration)
  if (!durationCandidate || durationCandidate.confidence < 0.5 || !durationCandidate.normalized) {
    return null
  }
  return durationCandidate.normalized.value
}

const dispatcher: Dispatcher<WitMessage, CliReply> = new Dispatcher(cliReplier)

class TimerHandler extends Handler {
  intent = 'timer'

  async handleFirstMessage (msg): Promise<*> {
    const duration = findDuration(msg)
    if (duration) {
      this.jumpTo(SetTimerHandler, {duration})
      return
    }
    await this.sendMessage({message: 'When do you want your timer to start?'})
    return {}
  }

  async handleSessionMessage (msg): Promise<*> {
    const duration = findDuration(msg)
    if (duration) {
      this.jumpTo(SetTimerHandler, {duration})
      return
    }
    await this.sendMessage({message: 'Sorry, I did not understand that. Please try again.'})
    return {}
  }
}

class SetTimerHandler extends Handler {

  _timer (id) {
    dispatcher.handleMessage(dispatcher.buildPostback(SetTimerHandler, { id }, 'cli'))
  }

  async handleJump (context: { duration: number }) {
    const id = Math.floor(Math.random() * 100000000).toString()
    setTimeout(() => this._timer(id), context.duration * 1000)
    await this.sendMessage({message: `I've set a timer with id ${id}`})
  }

  async handlePostback (postback: { id: string }): * {
    await this.sendMessage({message: `A timer with id ${postback.id} went off`})
  }
}

class FallbackHandler extends Handler {

  async handleMessage () {
    await this.sendMessage({message: 'Sorry. I did not get that.'})
  }
}

dispatcher.registerHandler(GreetingHandler)
dispatcher.registerHandler(TimerHandler)
dispatcher.registerHandler(FallbackHandler)
dispatcher.registerHandler(SetTimerHandler)

startCliWitBot(dispatcher)
