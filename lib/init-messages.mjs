export default function initMessages () {
  return [{
    role: 'system',
    time: new Date().toISOString(),
    content: 'Hi! I\'m Zengpt, a chatbot powered by GPT-3.5 Turbo. I\'m here to help you with any of your questions. What can I help you with?'
  }]
}