'use strict'
import QuizSocketClient from './quiz-socket-client.js'
import WebApp from './components/app/web-app.jsx'

// REVISE check if ES6 module import is possible for socket.io
// eslint-disable-next-line no-undef
const socket = io()
ReactDOM.render(<WebApp adapter={new QuizSocketClient(socket)} />, document.querySelector('#react-root'))
