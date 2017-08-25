// @flow

import Dispatcher from '../../src/dispatcher'
import Handler from '../../src/handler'
import { cliReplier, fetchGif, findBestCandidate, startCliWitBot } from '../utils'
import type { CliReply, WitMessage } from '../utils'

class GreetingHandler extends Handler {
  intent = 'greeting'
  async handleFirstMessage (msg): Promise<*> {
    this.sendMessage({message: 'Hello there!'})
    return {}
  }

}

class GifHandler extends Handler {
  intent = 'gif'
  async handleFirstMessage(msg): Promise<*> {
    await this.sendMessage({message: 'Sure! What would you like your gif to be about?'})
    return {}
  }

  async handleSessionMessage(msg): Promise<*> {
    const candidate = msg.entities.subject && findBestCandidate(msg.entities.subject)
    if (!candidate || candidate.confidence < 0.5) {
      await this.sendMessage({message: 'Sorry, I did not understand that. Please try again.'})
      return {}
    }
    await this.sendMessage({message: `Ok, I'll see what I can find about "${candidate.value}"`})
    const gif = await fetchGif(candidate.value)
    if (!gif) {
      await this.sendMessage({message: `I couldn't find any gif about ${candidate.value}`})
      return
    }
    await this.sendMessage({message: `I found this gif: ${gif}`})
  }
}

const dispatcher: Dispatcher<WitMessage, CliReply> = new Dispatcher(cliReplier)

dispatcher.registerHandler(GreetingHandler)
dispatcher.registerHandler(GifHandler)

startCliWitBot(dispatcher)
