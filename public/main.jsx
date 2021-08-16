'use strict'
import QuizSocketClient from './quiz-socket-client.js'

// REVISE this is right now needed because of a timing issue - Gorilla.WebApp seems used before it is ready. Once everything is migrated to JSX+ES6 imports, it should be gone...
setTimeout(function() {
    // REVISE check if ES6 module import is possible for socket.io
    // eslint-disable-next-line no-undef
    const socket = io()
    ReactDOM.render(<Gorilla.WebApp adapter={new QuizSocketClient(socket)} />, document.querySelector('#react-root'))
}, 1000)
