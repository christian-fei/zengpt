import http from 'node:http'
import OpenAI from 'openai'

const ai = new OpenAI()
const messages = []

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
    if (req.url === '/message' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        console.log(body)
        const text = decodeURIComponent(body.split('=')[1]).trim()
        if (!text) return res.statusCode = 400
        
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
    <div class="${message.role}-message">
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
        .my-message {
          display: block;
          width: 100%;
          font-size: 2rem;
          padding: 2.5rem 1rem;
          border: 1px solid #ccc;
          outline: none;
          margin: 0;
        }
        .user-message {
          display: block;
          width: 95%;
          font-size: 2rem;
          padding: 2.5rem 1rem;
          border-left: 1px solid green;
          outline: none;
          margin: 0;
        }
        .assistant-message {
          display: block;
          width: 95%;
          font-size: 2rem;
          padding: 2.5rem 1rem;
          border-left: 1px solid #de3;
          outline: none;
          margin: 0;
        }
        </style>
      </head>
      <body style="">
        <main style="height:99%;width:70em;max-width:100%;margin:0 auto;">
          <div style="height:99%;display:flex;flex-direction:column;" id="chat" x-data="{ text: '' }">
            <div style="flex:1;overflow-y:scroll;" id="messages">${renderMessages(messages)}</div>
            <input
              name="message"
              hx-post="/message"
              hx-trigger="keyup[keyCode==13]"
              hx-target="#messages"
              hx-swap="beforeend scroll:bottom"
              class="my-message" autofocus type="text" placeholder="your message">
          </div>
        </main>
        <script type="module" src="client.mjs"></script>
      </body>
    </html>
  `
}
function client () {
  return `
    //alert('Hello from client.mjs')
  `
}