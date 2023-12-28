import messageFromRequest from './lib/message-from-request.mjs'
import initMessages from './lib/init-messages.mjs'
import messagesView from './views/messages.mjs'
import mainView from './views/main.mjs'
import llmChat from './lib/llm-chat.mjs'
import {byChatId, listing, saveChat} from './chats.mjs'
import fs from 'fs'

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

      broadcastSSE('')

      res.statusCode = 200
      return res.end(messagesView(messages))
    }
    if (req.url === '/chat' && req.method === 'POST') {
      const text = await messageFromRequest(req)
      if (!text) {
        res.statusCode = 400
        return res.end(messagesView([]))
      }
      broadcastSSE('')
      console.log('user:', text)
      
      llmChat(messages, text, broadcastSSE, (text) => 
        console.log('llm:', text)
      )

      res.statusCode = 200
      if (messages.length <= 1) {
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
      return handleSSE(req, res, connections)
    }

    if (req.url === '/app.webmanifest') {
      res.setHeader('Content-Type', 'application/manifest+json')
      res.statusCode = 200
      return fs.createReadStream('./app.webmanifest').pipe(res)
    }
    if (req.url === '/images/icon-192x192.png') {
      res.setHeader('Content-Type', 'image/png')
      res.statusCode = 200
      return fs.createReadStream('./images/icon-192x192.png').pipe(res)
    }
    if (req.url === '/images/icon-512x512.png') {
      res.setHeader('Content-Type', 'image/png')
      res.statusCode = 200
      return fs.createReadStream('./images/icon-512x512.png').pipe(res)
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
function broadcastSSE (data = '') {
  connections.forEach(res => {
    res.write('id: ' + new Date().toISOString() + '\n')
    data.split('\n').forEach(d => {
      res.write('data: ' + d + '\n')
    })
    res.write('\n\n')
  })
}

function handleSSE (req, res, connections = []) {
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

