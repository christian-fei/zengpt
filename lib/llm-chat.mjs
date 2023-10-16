import OpenAI from 'openai'
import markdownIt from 'markdown-it'
import mdHighlight from "markdown-it-highlightjs"

const md = markdownIt().use(mdHighlight)
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.npm_config_openai_api_key
})

export default async function llmChat(messages, newUserMessage) {    
  const completion = await ai.chat.completions.create({
    messages: messages
                .concat([{ role: 'user', content: newUserMessage }])
                .map(m => ({role: m.role, content: m.content})),
    model: 'gpt-3.5-turbo',
  })

  let llmText = completion.choices[0].message.content.trim()
  llmText = md.render(llmText)

  const newMessages = [
    userMessage(newUserMessage),
    llmMessage(llmText)
  ]

  return newMessages
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
