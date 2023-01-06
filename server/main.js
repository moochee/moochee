import HistoryService from './history-service.js'
import httpServer from './http-server.js'
import QuizService from './quiz-service.js'

const { auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir, stripeConfig } = await import(process.argv[2])
const server = httpServer(auth, new QuizService(quizzesDir), dedicatedOrigin, gameExpiryTimer, new HistoryService(historyDir), stripeConfig)

const closeServer = () => server.close()
server.on('close', () => process.removeListener('SIGTERM', closeServer))
process.on('SIGTERM', closeServer)

server.listen(port, () => console.log(`Moochee started at ${port}`))
