
import markdownIt from 'markdown-it'
import mdHighlight from "markdown-it-highlightjs"
const md = markdownIt().use(mdHighlight)

export default function renderMessages(messages = []) {
  return messages.map(message => {
    return `
    <div hx-transition class="${message.role}-message">
    ${md.render(message.content)}
    </div>
    `;
  }).join('');
}