import http from 'node:http'
import OpenAI from 'openai'
import fs from 'fs'
import markdownIt from 'markdown-it'

if (process.env.OPENAI_API_KEY === undefined) {
  console.error('Please set OPENAI_API_KEY environment variable')
  process.exit(1)
}

const ai = new OpenAI()
let messages = initMessages()

function initMessages () {
  return [{
    role: 'system',
    time: new Date().toISOString(),
    content: 'Hi! I\'m Zengpt, a chatbot powered by GPT-3.5 Turbo. I\'m here to help you with any of your questions. What can I help you with?'
  }]
}
const server = http.createServer((req, res) => {
  console.log(new Date().toISOString(), req.method, req.url)
  try {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html')
      return res.end(index(messages))
    }
    if (req.url === '/chats' && req.method === 'GET') {
      const files = fs.readdirSync('chats')
      res.statusCode = 200
      return res.end(files.map(file => `<a x-on:click="messageDisabled=true" hx-get="/chats/${file}" hx-target="#messages" href="/chats/${file}">${file.replace('.json','')}</a>`).join('<br>'))
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
    if (req.url === '/chat' && req.method === 'DELETE') {
      messages = initMessages()
      return res.end(renderMessages(messages))
    }
    if (req.url === '/chat' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        const text = decodeURIComponent(body.split('=')[1]).trim()
        if (!text) {
          res.statusCode = 400
          return res.end(renderMessages([]))
        }
        
        const completion = await ai.chat.completions.create({
          messages: messages.concat([{ role: 'user', content: text }]).map(m => ({role: m.role, content: m.content})),
          model: 'gpt-3.5-turbo',
        })
        let llmMessage = completion.choices[0].message.content.trim()
        llmMessage = markdownIt().render(llmMessage)
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
        res.end(renderMessages(newMessages))
      })
      return
    }
    console.log(' -> 404')
    res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end()
  }
})

console.log(import.meta.url === `file://${process.argv[1]}` ? 'running as a script' : 'running as a module')

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/')
  })
}

export default server
export { messages }

function renderMessages(messages = []) {
  return messages.map(message => {
    return `
    <div hx-transition class="${message.role}-message">
    ${message.content}
    </div>
    `
  }).join('')
}

function index (messages = []) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>zengpt</title>
        <script src="//unpkg.com/htmx.org@1.9.6"></script>
        <script src="//unpkg.com/alpinejs" defer></script>
        <style>
        ${css()}
        </style>
      </head>
      <body x-data="{message:'',messageDisabled:false}">
        <header style="display:flex">
          <div style="flex:1";><h1>zengpt</h1></div>
          <div style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-delete="/chat" hx-target="#messages" x-on:click="$refs.message.focus();messageDisabled=false">new chat</button></div>
          <div style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-post="/chats" hx-target="#messages" x-on:click="$refs.message.value = '';messageDisabled=false">save chat</button></div>
          <div style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-get="/chats" hx-target="#chats">chats</button></div>
          <div id="chats">
          </div>
        </header>
        <main>
          <div style="height:99%;display:flex;flex-direction:column;" id="chat">
            <div id="messages" hx-swap="scroll:bottom">${renderMessages(messages)}</div>
            <input
              name="message"
              hx-post="/chat"
              hx-trigger="keyup[keyCode==13]"
              hx-target="#messages"
              hx-swap="beforeend scroll:bottom"
              hx-indicator="#loading-message"
              x-bind:disabled="messageDisabled"
              x-ref="message"
              x-model="message"
              x-on:keyup.enter="setTimeout(() => message = '', 10)"
              class="my-message" autofocus type="text" placeholder="your message">
            <div style="position:fixed;bottom:3em;right:2em;" class="htmx-indicator" id="loading-message">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" viewBox="0 0 24 24">
                <path fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" d="M12 2 L12 6 M12 18 L12 22 M4.93 4.93 L7.76 7.76 M16.24 16.24 L19.07 19.07 M2 12 L6 12 M18 12 L22 12"></path>
            </div>
          </div>
        </main>
      </body>
    </html>
  `
}

function css () {
  return `
html, body {
  min-height: 100%;
  height: 100%;
  margin: 0;
}
header {
  position:fixed;
  top:1em;
  left:1em;
  right:1em;
  padding:1em;
  border-radius:2em;
  border:1px solid lightgrey;
  background:white;
  color:black;
}
main {
  height:99%;
  width:70em;
  max-width:100%;
  margin:0 auto;
}
#messages {
  flex:1;
  overflow-y:scroll;
  padding-top:8em
}

.my-message {
  display: block;
  width: 100%;
  font-size: 2rem;
  padding: 2.5rem 1rem;
  border: 1px solid #ccc;
  outline: none;
  margin: 0;
}
.user-message,
.assistant-message,
.system-message {
  display: block;
  width: 95%;
  font-size: 2rem;
  padding: 2.5rem 1rem 2.5rem 2rem;
  outline: none;
  margin: 0;
  transition: all 0.5s ease;
  animation: fadein 0.5s ease;
  
  _font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.user-message {
  border-left: 5px solid green;
  background: rgba(221, 238, 255, 0.6);
}
.user-message::before {
  content: '👤';
}
.system-message {
  border-left: 5px solid red;
}
.system-message::before {
  content: '🤖';
}
.assistant-message {
  border-left: 5px solid #de3;
  background: rgba(221, 238, 255, 0.8);
}
.assistant-message::before {
  content: '🤖';
}
#loading-message svg {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`
}