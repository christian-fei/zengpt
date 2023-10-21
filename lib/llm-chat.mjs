import OpenAI from 'openai'
import markdownIt from 'markdown-it'
import mdHighlight from "markdown-it-highlightjs"
import renderMessages from '../views/messages.mjs'

const md = markdownIt().use(mdHighlight)
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.npm_config_openai_api_key
})

export default async function llmChat(messages, newUserMessage, callback = () => {}) {    
  const stream = await ai.chat.completions.create({
    messages: messages
                .concat([{ role: 'user', content: newUserMessage }])
                .map(m => ({role: m.role, content: m.content})),
    model: 'gpt-3.5-turbo',
    stream: true,
  })


  let message = ''
  for await (const part of stream) {
    message += part.choices[0]?.delta?.content || ''
    const text = renderMessages([{
      content: message,
      role: 'assistant'
    }])
    callback(text)
  }
  messages.push({
    content: newUserMessage,
    time: new Date().toISOString(),
    role: 'user'
  })
  messages.push({
    content: message,
    time: new Date().toISOString(),
    role: 'assistant'
  })
}


function userMessage(text) {
  return {
    content: text,
    time: new Date().toISOString(),
    role: 'user'
  }
}

function llmMessage(text) {
  return {
    content: text,
    time: new Date().toISOString(),
    role: 'assistant'
  }
}
