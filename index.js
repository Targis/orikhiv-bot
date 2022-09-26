const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const { NewMessage } = require('telegram/events')
const input = require('input')
const { regions } = require('./regions.js')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const BOT_TOKEN = process.env.BOT_TOKEN

const API_ID = parseInt(process.env.API_ID)
const API_HASH = process.env.API_HASH
const STRING_SESSION = process.env.STRING_SESSION

const SOURCE_CHAT_NAME = process.env.SOURCE_CHAT_NAME
const TARGET_CHAT_ID = process.env.TARGET_CHAT_ID

const stringSession = STRING_SESSION
  ? new StringSession(STRING_SESSION)
  : new StringSession('') // fill this later with the value from session.save()

;(async () => {
  console.log('Loading interactive example...')
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
  })

  async function eventPrint(event) {
    if (event.message.sender.username === SOURCE_CHAT_NAME) {
      const messageText = event.message.text
      const tag = messageText.split('\n').at(-1)

      if (!tag.includes('#')) return null

      const regionIndex = regions.findIndex((item) => item.tag === tag)

      if (regionIndex > -1) {
        const region = regions[regionIndex]
        const newMessage = messageText
          .replace(region.tag, '')
          .replace(region.in, region.out)
          .replace('Слідкуйте за подальшими повідомленнями.', '')
        await client.sendMessage(TARGET_CHAT_ID, {
          message: newMessage,
        })
      }
    }
  }

  // adds an event handler for new messages
  client.addEventHandler(eventPrint, new NewMessage({}))

  await client.start({
    phoneNumber: async () => await input.text('Please enter your number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () =>
      await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  })
  console.log('You should now be connected.')
  // console.log(client.session.save()) // Save this string to avoid logging in again
})()
