import fs from 'fs'
import messageFromRequest from './lib/message-from-request.mjs'
import initMessages from './lib/init-messages.mjs'
import messagesView from './views/messages.mjs'
import mainView from './views/main.mjs'
import llmChat from './lib/llm-chat.mjs'


export default async function router (req, res, messages) {
  console.log(new Date().toISOString(), req.method, req.url)
  try {
    if (req.url === '/') {
      const chats = fs.readdirSync('chats')
      res.setHeader('Content-Type', 'text/html')
      return res.end(mainView(messages, chats))
    }
    if (req.url.startsWith('/chats') && req.method === 'GET') {
      const chatId = req.url.split('/')[2]
      const file = fs.readFileSync(`chats/${chatId}`)
      res.statusCode = 200
      return res.end(messagesView(JSON.parse(file.toString())))
    }
    if (req.url === '/chats' && req.method === 'POST') {
      if (!fs.existsSync('chats')) fs.mkdirSync('chats')
      if (messages.length === 1) {
        res.statusCode = 400
        return res.end(messagesView(messages))
      }
      
      const timestamp = new Date().toISOString().replace(/:/g, '-')
      fs.writeFileSync(`chats/${timestamp}.json`, JSON.stringify(messages, null, 2))

      messages.length = 0
      messages.push(...initMessages())

      res.statusCode = 200
      return res.end(messagesView(messages))
    }
    if (req.url === '/chat' && req.method === 'GET') {
      res.statusCode = 200
      return res.end(messagesView(messages))
    }
    if (req.url === '/chat' && req.method === 'DELETE') {
      messages.length = 0
      messages.push(...initMessages())

      res.statusCode = 200
      return res.end(messagesView(messages))
    }
    if (req.url === '/chat' && req.method === 'POST') {
      const text = await messageFromRequest(req)
      if (!text) {
        res.statusCode = 400
        return res.end(messagesView([]))
      }

      const newMessages = await llmChat(messages, text)
      messages.push(...newMessages)
      res.statusCode = 200
      return res.end(messagesView(newMessages))
    }
    console.log(' -> 404')
    res.statusCode = 404
    return res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    return res.end()
  }
}