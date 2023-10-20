import http from 'node:http'
import router from './router.mjs'
import initMessages from './lib/init-messages.mjs'

if (!process.env.OPENAI_API_KEY && !process.env.npm_config_openai_api_key) {
  console.error('Please set OPENAI_API_KEY environment variable')
  process.exit(1)
}

let messages = initMessages()
const HTTP_PORT = parseInt(process.env.HTTP_PORT || 3000)

const server = http.createServer((req, res) => router(req, res, messages))

console.log(import.meta.url === `file://${process.argv[1]}` ? 'running as a script' : 'running as a module')

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(HTTP_PORT, () => {
    console.log(`Server running at http://localhost:${HTTP_PORT}/`)
  })
}

export default server
