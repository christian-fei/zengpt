import http from 'node:http'
import router from './router.mjs'
import initMessages from './lib/init-messages.mjs'

let messages = initMessages()
 
if (!process.env.OPENAI_API_KEY && !process.env.npm_config_openai_api_key) {
  console.error('Please set OPENAI_API_KEY environment variable')
  process.exit(1)
}

const server = http.createServer((req, res) => router(req, res, messages))

console.log(import.meta.url === `file://${process.argv[1]}` ? 'running as a script' : 'running as a module')

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/')
  })
}

export default server
