'use strict'
import { WebSocketServer } from 'ws'
import QuizService from './quiz-service.js'
import Games from './games.js'

// REVISE it's a bit weird that we are emitting events here direcly, but also indirectly through games.js->events.publish
//        maybe it can be consolidated
export default function create(server) {
    const webSocketServer = new WebSocketServer({ server })
    const quizService = new QuizService()
    const games = new Games(quizService, webSocketServer)

    webSocketServer.on('connection', (webSocket) => {
        webSocket.on('message', async (message) => {
            // REVISE why do we need the response variable, can we not just inline?
            //        alternatively, could create a send function that wraps the JSON.stringify
            let response, request = JSON.parse(message)

            if (request.event === 'getQuizzes') {
                const quizzes = await games.getQuizzes()
                response = { event: 'quizzesReceived', args: [quizzes] }
                webSocket.send(JSON.stringify(response))
            }
            else if (request.event === 'host') {
                const { gameId, quizTitle } = await games.host(...request.args)
                webSocket.gameId = gameId
                response = { event: 'gameStarted', args: [gameId, quizTitle] }
                webSocket.send(JSON.stringify(response))
            } else if (request.event === 'join') {
                try {
                    const { quizTitle, name, avatar, otherPlayers } = games.join(...request.args)
                    const gameId = request.args[0]
                    webSocket.gameId = gameId
                    webSocket.playerName = name
                    response = { event: 'joiningOk', args: [quizTitle, name, avatar, otherPlayers] }
                    webSocket.send(JSON.stringify(response))
                } catch (error) {
                    response = { event: 'joiningFailed', args: [error.message] }
                    webSocket.send(JSON.stringify(response))
                }
            } else if (request.event === 'nextRound') {
                games.nextRound(...request.args)
            } else if (request.event === 'guess') {
                games.guess(...request.args)
            }
        })

        webSocket.on('close', () => {
            const gameId = webSocket.gameId
            const name = webSocket.playerName
            games.disconnect(gameId, name)
        })
    })

    return webSocketServer
}