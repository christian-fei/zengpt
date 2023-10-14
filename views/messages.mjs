export default function renderMessages(messages = []) {
  return messages.map(message => {
    return `
    <div hx-transition class="${message.role}-message">
    ${message.content}
    </div>
    `;
  }).join('');
}
