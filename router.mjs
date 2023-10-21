import messageFromRequest from './lib/message-from-request.mjs'
import initMessages from './lib/init-messages.mjs'
import messagesView from './views/messages.mjs'
import mainView from './views/main.mjs'
import llmChat from './lib/llm-chat.mjs'
import {byChatId, listing, saveChat} from './chats.mjs'

let connections = []

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

      llmChat(messages, text, (data) => {
        connections.forEach(res => {
          res.write('data: ' + data.replace(/\n/gi,'') + '\n\n');
        })
      })
      res.statusCode = 200
      if (messages.length === 1) {
        return res.end(messagesView([{
          content: text,
          time: new Date().toISOString(),
          role: 'user'
        }]))
      }
      return res.end(messagesView([messages[messages.length - 1], {
        content: text,
        time: new Date().toISOString(),
        role: 'user'
      }]))
    }

    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      return handleSSE(res, connections)
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

function handleSSE (res, connections = []) {
  connections.push(res)
  res.on('close', () => {
    connections.splice(connections.findIndex(c => res === c), 1)
  })
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
}