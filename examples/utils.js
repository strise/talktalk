// @flow

import readline from 'readline'
import type Dispatcher from '../src/dispatcher'

export type CliMessage = {
  type: 'message',
  intent?: string,
  sender: string,
  message: string
}

export type CliReply = {
  message: string
}

function prompt(dispatcher, rl) {
  rl.question('You > ', (answer) => {
    const msg: CliMessage = {type: 'message', sender: 'cli', message: answer}
    dispatcher.handleMessage(msg).then(() => prompt(dispatcher, rl))
  })
}

export function startCliBot(dispatcher: Dispatcher<CliMessage, *, CliReply>) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  prompt(dispatcher, rl)
}


export async function cliReplier (reply: CliReply) {
  console.log('Bot > ' + reply.message)
}
