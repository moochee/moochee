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
        const reply = (message) => webSocket.send(JSON.stringify(message))

        webSocket.on('message', (message) => {
            const { command, args } = JSON.parse(message)

            const commandHandlers = {
                getQuizzes: async () => {
                    const quizzes = await games.getQuizzes()
                    reply({ event: 'quizzesReceived', args: [quizzes] })
                },
                host: async () => {
                    const { gameId, quizTitle } = await games.host(...args)
                    webSocket.gameId = gameId
                    reply({ event: 'gameStarted', args: [gameId, quizTitle] })
                },
                join: () => {
                    try {
                        const [gameId, name] = args
                        const game = games.find(gameId)
                        const { quizTitle, avatar, otherPlayers } = game.join(name)
                        webSocket.gameId = gameId
                        webSocket.playerName = name
                        reply({ event: 'joiningOk', args: [quizTitle, name, avatar, otherPlayers] })
                    } catch (error) {
                        reply({ event: 'joiningFailed', args: [error.message] })
                    }
                },
                nextRound: () => {
                    const [gameId] = args
                    const game = games.find(gameId)
                    game.nextRound()
                },
                guess: () => {
                    const [gameId, name, answerIndex] = args
                    const game = games.find(gameId)
                    game.guess(name, answerIndex)
                }
            }

            commandHandlers[command]()
        })

        webSocket.on('close', () => {
            if (!webSocket.gameId || !webSocket.playerName) return
            try {
                const game = games.find(webSocket.gameId)
                game.disconnect(webSocket.playerName)
            } catch (error) {
                console.log(error)
            }
        })
    })

    return webSocketServer
}