'use strict'

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./service-worker.js')
}

import loadCss from '../../load-css.js'
import QuizSocketClient from './quiz-socket-client.js'
import WebApp from './components/app/web-app.jsx'

loadCss('./font/komikatext_regular_macroman/stylesheet.css')
loadCss('./style.css')

// REVISE don't use jsx here so the linter rules can be cleaned up
// REVISE check if ES6 module import is possible for socket.io
// eslint-disable-next-line no-undef
const socket = io()

window.onload = function () {
    // eslint-disable-next-line no-undef
    ReactDOM.render(<WebApp adapter={new QuizSocketClient(socket)} />, document.querySelector('#react-root'))
}
