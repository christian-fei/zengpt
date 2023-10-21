
import markdownIt from 'markdown-it'
import mdHighlight from "markdown-it-highlightjs"
const md = markdownIt().set({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
 }).use(mdHighlight)

export default function renderMessages(messages = []) {
  return messages.map(message => {
    //console.log(md.render(message.content))
    return `
    <div hx-transition class="${message.role}-message">
    ${md.render(message.content)}
    </div>
    `;
  }).join('');
}
