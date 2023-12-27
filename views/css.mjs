export default function css() {
    return `
  html, body {
    height: 90vh;
    margin: 0;
    font-family: monospace;
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
    height:95vh;
    _width:80em;
    max-width:100%;
    margin:0 auto;
  }
  #messages {
    flex:1;
    overflow-y:scroll;
    padding-top:8em;
    padding-bottom:8em;
    max-width:80em;
    margin: 0 auto;
    padding-right:0.5em;
    padding-left:0.5em;
    overflow-x: hidden !important;
  }  
  .my-message {
    display: block;
    max-width: 50em;
    width: 100%;
    font-size: 2rem;
    padding: 2rem 1rem;
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
    max-width: 80em;
    font-size: 2rem;
    padding: 0.5rem 1rem 0.5rem 1rem;
    outline: none;
    margin: 0 auto;
    transition: all 0.5s ease;
    animation: fadein 0.5s ease;
    
    font-family: monospace;
    _white-space: pre-wrap;
    _word-wrap: break-word;
    _overflow-wrap: break-word;
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