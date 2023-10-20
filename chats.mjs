import fs from 'fs'

export function listing () {
  if (!fs.existsSync('chats')) fs.mkdirSync('chats')
  return fs.readdirSync('chats')
}

export function byChatId (chatId) {
  const file = fs.readFileSync(`chats/${chatId}`)
  if (!file) return []
  return JSON.parse(file.toString())
}

export function saveChat(chatId, messages) {
  if (!fs.existsSync('chats')) fs.mkdirSync('chats')
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  fs.writeFileSync(`chats/${timestamp}.json`, JSON.stringify(messages, null, 2))
}