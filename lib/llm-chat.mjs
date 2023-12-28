import OpenAI from 'openai'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.npm_config_openai_api_key
})

export default async function llmChat(messages, newUserMessage, callback = () => {}, finished = () => {}) {    
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
    callback(message)
  }
  finished(message)
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
