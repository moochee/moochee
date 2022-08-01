'use strict'

import HistoryService from './history-service.js'
import httpServer from './http-server.js'
import QuizService from './quiz-service.js'

const { appStopper, auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir } = await import(process.argv[2])
const server = httpServer(appStopper, auth, new QuizService(quizzesDir), dedicatedOrigin, gameExpiryTimer, new HistoryService(historyDir))
server.listen(port, () => console.log(`Moochee started at ${port}`))
