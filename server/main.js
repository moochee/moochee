'use strict'

import HistoryService from './history-service.js'
import httpServer from './http-server.js'
import QuizService from './quiz-service.js'

// REVISE maybe this could also be moved to the bindings
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const { appStopper, auth, quizzesDir, dedicatedOrigin, port, historyDir } = (await import(process.argv[2])).default
const server = httpServer(appStopper, auth, new QuizService(quizzesDir), dedicatedOrigin, gameExpiryTimer, new HistoryService(historyDir))
server.listen(port, () => console.log(`Moochee started at ${server.address().port}`))
