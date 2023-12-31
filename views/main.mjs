import renderMessages from './messages.mjs'
import css from './css.mjs'

export default function main(messages = [], chats = []) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>zengpt</title>
        <meta name="application-name" content="zengpt">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="theme-color" content="white">
        <link rel="manifest" href="/app.webmanifest">
        <script src="//unpkg.com/htmx.org"></script>
        <script src="//unpkg.com/alpinejs" defer></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/sse.js"></script>
        <!--<link href="https://unpkg.com/prismjs@1.20.0/themes/prism-okaidia.css" rel="stylesheet">-->
        <style>${css()}</style>
      </head>
      <body x-data="{
        message:'',
        llmMessage:'',
        messageDisabled:false,
        viewingPreviousChat:false,
        pristineChat:${messages.length === 1}
      }">
        <header>
          <div style="display:flex">
            <div style="flex:1";><h3>zengpt</h3></div>
            <div x-show="!pristineChat" style="flex:1;">
              <button
                style="display:block;margin-top:1rem;padding:1rem;font-size:1rem;"
                hx-delete="/chat"
                hx-target="#messages aside"
                @click="$refs.message.focus();messageDisabled=false;pristineChat=true;">
                new chat
              </button>
            </div>
            <!--
            <div x-show="!pristineChat" style="flex:1;";>
              <button 
                style="display:block;margin-top:1rem;padding:1rem;font-size:1rem;"
                hx-post="/chats" 
                hx-target="#messages" 
                @click="$refs.message.value = '';messageDisabled=false;pristineChat=true">
                save chat
              </button>
            </div>
            <div x-show="viewingPreviousChat" style="flex:1;";>
              <button 
                style="display:block;margin-top:1rem;padding:1rem;font-size:1rem;"
                hx-get="/chat"
                hx-target="#messages"
                @click="$refs.message.value = '';messageDisabled=false;">
                go back
              </button>
            </div>
            -->
          </div>
          <!--
          <div id="chats">
            <details>
              <summary>chats</summary>
              ${chats
                .map(chat => `
                <a 
                  @click="messageDisabled=true;pristineChat=true;viewingPreviousChat=true" 
                  hx-get="/chats/${chat}" 
                  hx-target="#messages" 
                  href="/chats/${chat}">
                    ${chat.replace('.json', '')}
                </a>
                `).join('<br>')}
            </details>
          </div>
          -->
        </header>
        <main>
          <div id="chat" style="display:flex;flex-direction:column;height:95vh">
            <div x-ref="messages" id="messages" style="flex:1" hx-swap="scroll:bottom">
              <aside>
              ${renderMessages(messages)}
              </aside>
              <div
                style="min-height:10em;"
                x-ref="llmMessage"
                id="llmMessage"
                hx-ext="sse"
                sse-connect="/ssechat"
                sse-swap="message"></div>
            </div>
            <input
              name="message"
              hx-post="/chat"
              hx-trigger="keyup[keyCode==13]"
              hx-target="#messages aside"
              hx-swap="beforeend scroll:bottom"
              hx-indicator="#loading-message"
              hx-on:htmx:before-request="this.disabled=true"
              hx-on:htmx:after-request="this.disabled=false;setTimeout(() => this.focus(), 50)"
              x-bind:disabled="messageDisabled"
              x-ref="message"
              x-model="message"
              @keyup.enter="setTimeout(() => {message = '';pristineChat = false}, 10)"
              class="my-message" autofocus type="text" placeholder="your message">
            <div style="position:fixed;bottom:3em;right:2em;" class="htmx-indicator" id="loading-message">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" viewBox="0 0 24 24">
                <path fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" d="M12 2 L12 6 M12 18 L12 22 M4.93 4.93 L7.76 7.76 M16.24 16.24 L19.07 19.07 M2 12 L6 12 M18 12 L22 12"></path>
            </div>
          </div>
        </main>
        <script>
        document.addEventListener('htmx:sseMessage', debounce(function(event) {
          // window.llmMessage.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'})
          window.messages.scrollTop = window.messages.scrollHeight
        }, 50, true))
        function debounce(func, wait = 50, immediate) {
          var timeout;
          return function() {
            var context = this, args = arguments;
            var later = function() {
              timeout = null;
              if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
          };
        }
        
        </script>
      </body>
    </html>
  `;
}
