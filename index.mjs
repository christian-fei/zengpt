import http from 'node:http'
import OpenAI from 'openai'

const ai = new OpenAI()
let messages = initMessages()

function initMessages () {
  return [{
    role: 'system',
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
    if (req.url === '/client.mjs') {
      res.setHeader('Content-Type', 'application/javascript')
      return res.end(client())
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
        console.log(body)
        const text = decodeURIComponent(body.split('=')[1]).trim()
        if (!text) {
          res.statusCode = 400
          return res.end(renderMessages([]))
        }
        
        const completion = await ai.chat.completions.create({
          messages: messages.concat([{ role: 'user', content: text }]).map(m => ({role: m.role, content: m.content})),
          model: 'gpt-3.5-turbo',
        })
        const llmMessage = completion.choices[0].message.content.trim()
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
  console.log('rendering index', messages.length)
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>zengpt</title>
        <script src="//unpkg.com/htmx.org@1.9.6"></script>
        <script src="//unpkg.com/alpinejs" defer></script>
        <style>
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
          
          _font-family: monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
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
        </style>
      </head>
      <body x-data="{message:''}">
        <header style="display:flex">
          <div style="flex:1";><h1>zengpt</h1></div>
          <div style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-target="#messages" hx-delete="/chat" x-on:click="$refs.message.focus()">new chat</button></div>
        </header>
        <main>
          <div style="height:99%;display:flex;flex-direction:column;" id="chat">
            <div id="messages">${renderMessages(messages)}</div>
            <input
              name="message"
              hx-post="/chat"
              hx-trigger="keyup[keyCode==13]"
              hx-target="#messages"
              hx-swap="beforeend scroll:bottom"
              hx-indicator="#loading-message"
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
        <!--<script type="module" src="client.mjs"></script>-->
      </body>
    </html>
  `
}
function client () {
  return `
    //alert('Hello from client.mjs')
  `
}