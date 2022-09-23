const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')

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
    const message = event.message

    // Checks if it's a private message (from user or bot)
    if (event.isPrivate) {
      // prints sender id
      console.log(message.senderId)
      // read message
      if (message.text == 'hello') {
        const sender = await message.getSender()
        console.log('sender is', sender)
        await client.sendMessage(sender, {
          message: `hi your id is ${message.senderId}`,
        })
      }
    }
  }

  // adds an event handler for new messages
  client.addEventHandler(eventPrint, new NewMessage({}))

  // client.on(events.NewMessage(chats=('air_alert_ua_test')), )

  await client.start({
    phoneNumber: async () => await input.text('Please enter your number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () =>
      await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  })
  console.log('You should now be connected.')
  // console.log(client.session.save()) // Save this string to avoid logging in again
  // await client.sendMessage('targis', { message: 'Hello!' })
})()
