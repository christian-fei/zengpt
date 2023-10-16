import messageFromRequest from './lib/message-from-request.mjs'
import initMessages from './lib/init-messages.mjs'
import messagesView from './views/messages.mjs'
import mainView from './views/main.mjs'
import llmChat from './lib/llm-chat.mjs'
import {byChatId, listing, saveChat} from './chats.mjs'

export default async function router (req, res, messages) {
  console.log(new Date().toISOString(), req.method, req.url)
  try {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html')
      return res.end(mainView(messages, listing()))
    }
    if (req.url.startsWith('/chats') && req.method === 'GET') {
      const chatId = req.url.split('/')[2]
      res.statusCode = 200
      return res.end(messagesView(byChatId(chatId)))
    }
    if (req.url === '/chats' && req.method === 'POST') {
      if (messages.length === 1) {
        res.statusCode = 400
        return res.end(messagesView(messages))
      }

      saveChat(new Date().toISOString().replace(/:/g, '-'), messages)
      
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