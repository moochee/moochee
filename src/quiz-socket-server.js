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
        const send = (reply) => {
            webSocket.send(JSON.stringify(reply))
        }

        webSocket.on('message', async (message) => {
            let request = JSON.parse(message)

            if (request.event === 'getQuizzes') {
                const quizzes = await games.getQuizzes()
                send({ event: 'quizzesReceived', args: [quizzes] })
            }
            else if (request.event === 'host') {
                const { gameId, quizTitle } = await games.host(...request.args)
                webSocket.gameId = gameId
                send({ event: 'gameStarted', args: [gameId, quizTitle] })
            } else if (request.event === 'join') {
                try {
                    const [gameId, name] = request.args
                    const game = games.find(gameId)
                    const { quizTitle, avatar, otherPlayers } = game.join(name)
                    webSocket.gameId = gameId
                    webSocket.playerName = name
                    send({ event: 'joiningOk', args: [quizTitle, name, avatar, otherPlayers] })
                } catch (error) {
                    send({ event: 'joiningFailed', args: [error.message] })
                }
            } else if (request.event === 'nextRound') {
                const [gameId] = request.args
                const game = games.find(gameId)
                game.nextRound()
            } else if (request.event === 'guess') {
                const [gameId, name, answerIndex] = request.args
                const game = games.find(gameId)
                game.guess(name, answerIndex)
            }
        })

        webSocket.on('close', () => {
            const gameId = webSocket.gameId
            if (!gameId) return
            try {
                const game = games.find(gameId)
                const name = webSocket.playerName
                if (!name) return
                game.disconnect(name)
            } catch (error) {
                console.log(error)
            }
        })
    })

    return webSocketServer
}