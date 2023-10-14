import renderMessages from './messages.mjs';

export default function main(messages = [], chats = []) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>zengpt</title>
        <script src="//unpkg.com/htmx.org@1.9.6"></script>
        <script src="//unpkg.com/alpinejs" defer></script>
        <link href="https://unpkg.com/prismjs@1.20.0/themes/prism-okaidia.css" rel="stylesheet">
        <style>
        ${css()}
        </style>
      </head>
      <body x-data="{message:'',messageDisabled:false,viewingPreviousChat:false,pristineChat:${messages.length === 1}}">
        <header>
          <div style="display:flex">
            <div style="flex:1";><h1>zengpt</h1></div>
            <div x-show="!pristineChat" style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-delete="/chat" hx-target="#messages" x-on:click="$refs.message.focus();messageDisabled=false;pristineChat=true">new chat</button></div>
            <div x-show="!pristineChat" style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-post="/chats" hx-target="#messages" x-on:click="$refs.message.value = '';messageDisabled=false;pristineChat=true">save chat</button></div>
            <div x-show="viewingPreviousChat" style="flex:1;";><button style="display:block;padding:1rem;font-size:1.5rem;" hx-get="/chat" hx-target="#messages" x-on:click="$refs.message.value = '';messageDisabled=false;">go back</button></div>
          </div>
          <div id="chats">
            <details>
              <summary>chats</summary>
              ${chats.map(chat => `<a x-on:click="messageDisabled=true;pristineChat=true;viewingPreviousChat=true" hx-get="/chats/${chat}" hx-target="#messages" href="/chats/${chat}">${chat.replace('.json', '')}</a>`).join('<br>')}
            </details>
          </div>
        </header>
        <main>
          <div style="height:99%;display:flex;flex-direction:column;" id="chat">
            <div id="messages" hx-swap="scroll:bottom">${renderMessages(messages)}</div>
            <input
              name="message"
              hx-post="/chat"
              hx-trigger="keyup[keyCode==13]"
              hx-target="#messages"
              hx-swap="beforeend scroll:bottom"
              hx-indicator="#loading-message"
              hx-on:htmx:before-request="this.disabled=true"
              hx-on:htmx:after-request="this.disabled=false;setTimeout(() => this.focus(), 20)"
              x-bind:disabled="messageDisabled"
              x-ref="message"
              x-model="message"
              x-on:keyup.enter="setTimeout(() => {message = '';pristineChat = false}, 10)"
              class="my-message" autofocus type="text" placeholder="your message">
            <div style="position:fixed;bottom:3em;right:2em;" class="htmx-indicator" id="loading-message">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" viewBox="0 0 24 24">
                <path fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" d="M12 2 L12 6 M12 18 L12 22 M4.93 4.93 L7.76 7.76 M16.24 16.24 L19.07 19.07 M2 12 L6 12 M18 12 L22 12"></path>
            </div>
          </div>
        </main>
      </body>
    </html>
  `;
}
function css() {
  return `
html, body {
  min-height: 100%;
  height: 100%;
  margin: 0;
}
header {
  position:fixed;
  z-index:100;
  top:1em;
  left:1em;
  right:1em;
  padding:1em;
  border-radius:2em;
  border:1px solid lightgrey;
  background:white;
  color:black;
}
main {
  height:99%;
  width:70em;
  max-width:100%;
  margin:0 auto;
}
#messages {
  flex:1;
  overflow-y:scroll;
  padding-top:8em
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
pre {
  background-color: black !important;
}
.user-message,
.assistant-message,
.system-message {
  display: block;
  width: 95%;
  font-size: 2rem;
  padding: 2.5rem 1rem 2.5rem 2rem;
  outline: none;
  margin: 0;
  transition: all 0.5s ease;
  animation: fadein 0.5s ease;
  
  _font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.user-message {
  border-left: 5px solid green;
  background: rgba(221, 238, 255, 0.6);
}
.user-message::before {
  content: '👤';
}
.system-message {
  border-left: 5px solid red;
}
.system-message::before {
  content: '🤖';
}
.assistant-message {
  border-left: 5px solid #de3;
  background: rgba(221, 238, 255, 0.8);
}
.assistant-message::before {
  content: '🤖';
}
#loading-message svg {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;
}
