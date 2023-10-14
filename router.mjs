import fs from 'fs'
import OpenAI from 'openai'
import markdownIt from 'markdown-it'
import mdHighlight from "markdown-it-highlightjs"
import messageFromRequest from './lib/message-from-request.mjs'
import initMessages from './lib/init-messages.mjs'
import renderMessages from './views/messages.mjs'
import main from './views/main.mjs'

let messages = initMessages()
const md = markdownIt().use(mdHighlight)
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.npm_config_openai_api_key
})


export default async function router (req, res) {
  console.log(new Date().toISOString(), req.method, req.url)
  try {
    if (req.url === '/') {
      const chats = fs.readdirSync('chats')
      res.setHeader('Content-Type', 'text/html')
      return res.end(main(messages, chats))
    }
    if (req.url.startsWith('/chats') && req.method === 'GET') {
      const chatId = req.url.split('/')[2]
      const file = fs.readFileSync(`chats/${chatId}`)
      const messages = JSON.parse(file.toString())
      res.statusCode = 200
      return res.end(renderMessages(messages))
    }
    if (req.url === '/chats' && req.method === 'POST') {
      if (!fs.existsSync('chats')) fs.mkdirSync('chats')
      if (messages.length === 1) {
        res.statusCode = 400
        return res.end(renderMessages(messages))
      }
      const timestamp = new Date().toISOString().replace(/:/g, '-')
      fs.writeFileSync(`chats/${timestamp}.json`, JSON.stringify(messages, null, 2))
      messages = initMessages()

      res.statusCode = 200
      return res.end(renderMessages(messages))
    }
    if (req.url === '/chat' && req.method === 'GET') {
      return res.end(renderMessages(messages))
    }
    if (req.url === '/chat' && req.method === 'DELETE') {
      messages = initMessages()
      return res.end(renderMessages(messages))
    }
    if (req.url === '/chat' && req.method === 'POST') {
      const text = await messageFromRequest(req)
      if (!text) {
        res.statusCode = 400
        return res.end(renderMessages([]))
      }
      
      const completion = await ai.chat.completions.create({
        messages: messages.concat([{ role: 'user', content: text }]).map(m => ({role: m.role, content: m.content})),
        model: 'gpt-3.5-turbo',
      })
      let llmMessage = completion.choices[0].message.content.trim()
      llmMessage = md.render(llmMessage)
      const newMessages = [
        {
          content: text,
          time: new Date().toISOString(),
          role: 'user'
        },
        {
          content: llmMessage,
          time: new Date().toISOString(),
          role: 'assistant'
        }
      ]
      messages.push(...newMessages)
      res.statusCode = 200
      return res.end(renderMessages(newMessages))
    }
    console.log(' -> 404')
    return res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    return res.end()
  }
}




