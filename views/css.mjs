export default function css() {
    return `
  html, body {
    height: 95vh;
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
    height:95vh;
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
    width: 95vw;
    font-size: 2rem;
    padding: 2.5rem 1rem;
    border: 1px solid #ccc;
    outline: none;
    margin: 0 auto;
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
`
}