'use strict'

// this file could become our bootstrapping file:
// load the initial components like web-app.js using 'import', and rendering them using jsx

import QuizSocketClient from '../quiz-socket-client.js'

ReactDOM.render(<div>hello world</div>, document.querySelector('#react-root'))
