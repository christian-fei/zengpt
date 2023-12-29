export default function css() {
    return `
  html, body {
    height: 100vh;
    margin: 0;
    font-family: monospace;
    font-size: 18px;
  }
  header {
    position:fixed;
    z-index:100;
    top:0.75em;
    left:0.75em;
    right:0.75em;
    padding:1em;
    border-radius:2em;
    border:1px solid lightgrey;
    background:white;
    /* bg super light grey */
    background: #f8f8f8;
    color:black;
  }
  main {
    _height:90vh;
    _width:80em;
    _max-width:99%;
    margin:0 auto;
  }
  #messages {
    flex:1;
    overflow-y:scroll;
    padding-top:6em;
    padding-bottom:4em;
    max-width:60em;
    margin: 0 auto;
    padding-right:0.75em;
    padding-left:0.75em;
    overflow-x: hidden !important;
  }  
  .my-message {
    display: block;
    position: fixed;
    bottom: 0.75em;
    left: 0.75em;
    right: 0.75em;
    max-width: 60em;
    font-size: 1.125rem;
    padding: 1rem 1rem;
    border: 1px solid #ccc;
    outline: none;
    margin: 0 auto;
  }
  pre {
    background-color: #aaa !important;
    color: black !important;
    overflow-x: auto !important;
  }
  .user-message,
  .assistant-message,
  .system-message {
    display: block;
    width: 100%;
    max-width: 60em;
    font-size: 1rem;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
    outline: none;
    margin: 0 auto;
    transition: all 0.5s ease;
    animation: fadein 0.5s ease;
    
    font-family: monospace;
    _white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    _word-break: break-all;
    hyphens: auto;
  }
  @keyframes fadein {
    from { opacity: 0.6; }
    to   { opacity: 1; }
  }
  .user-message {
    background: rgba(221, 238, 255, 0.7);
  }
  .user-message::before {
    _content: '👤';
  }
  .system-message {
    _border-left: 5px solid red;
  }
  .system-message::before {
    _content: '🤖';
  }
  .assistant-message {
    _border-left: 5px solid #de3;
    _background: rgba(221, 238, 255, 0.6);
  }
  .assistant-message::before {
    _content: '🤖';
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
`
}