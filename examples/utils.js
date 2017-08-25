// @flow

import readline from 'readline'
import type Dispatcher, { BaseMessage } from '../src/dispatcher'
import { Wit } from 'node-wit'
import config from 'config'
import request from 'superagent'

const accessToken = config.get('wit.accessToken')
const wit = new Wit({accessToken})

export type CliMessage = {
  type: 'message',
  intent?: string,
  sender: string,
  message: string
}

export type WitEntityMatch = {
  confidence: number,
  value: string,
  normalized?: {value: number}
}

export type WitEntities = {
  [string]: WitEntityMatch[]
}

export type WitMessage = CliMessage & { entities: WitEntities }

export type CliReply = {
  message: string
}

function prompt<X: BaseMessage> (dispatcher: Dispatcher<X, CliReply>, rl, enricher: (CliMessage) => Promise<X>) {
  rl.question('You > ', (answer) => {
    const msg: CliMessage = {type: 'message', sender: 'cli', message: answer}
    enricher(msg)
      .then(newMsg => dispatcher.handleMessage(newMsg))
      .then(() => prompt(dispatcher, rl, enricher))
  })
}

export function startCliBot (dispatcher: Dispatcher<CliMessage, CliReply>) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  prompt(dispatcher, rl, async msg => msg)
}

export function findBestCandidate (matches: WitEntityMatch[]): WitEntityMatch {
  return matches
    .reduce((i1, i2) => i1.confidence > i2.confidence
      ? i1
      : i2, {value: '', confidence: 0})
}

async function enrichMessage (message: CliMessage): Promise<WitMessage> {
  const entities = await witEntitiesFromMessage(message.message)
  const intent = entities.intent && findBestCandidate(entities.intent).value
  return {
    ...message,
    entities,
    intent
  }
}

export function startCliWitBot (dispatcher: Dispatcher<WitMessage, CliReply>) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  prompt(dispatcher, rl, enrichMessage)
}

export async function cliReplier (reply: CliReply) {
  console.log('Bot > ' + reply.message)
}

export async function witEntitiesFromMessage (message: string): Promise<WitEntities> {
  if (!message) {
    return {}
  }
  return (await wit.message(message)).entities
}

export async function fetchGif (q: string) : Promise<?string> {
  const {body} = await request
    .get('https://api.giphy.com/v1/gifs/search')
    .query({
      api_key: config.get('giphy.apiKey'),
      q
    })
  if (!body.data.length) {
    return null
  }
  return body.data[0].images.fixed_height.url
}
