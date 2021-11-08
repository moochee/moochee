'use strict'

import { WebSocketServer } from 'ws'
import QuizService from './quiz-service.js'
import Games from './games.js'
import Events from './events.js'
import Players from './players.js'
import Avatars from './avatars.js'

export default function create(server, directory) {
    const webSocketServer = new WebSocketServer({ server })
    const quizService = new QuizService(directory)
    const games = new Games(quizService, setTimeout)
    webSocketServer.games = games

    webSocketServer.on('connection', (webSocket) => {
        const events = new Events(webSocketServer, webSocket)

        webSocket.on('message', (message) => {
            const { command, args } = JSON.parse(message)

            const commandHandlers = {
                getQuizzes: async () => {
                    await games.getQuizzes(events)
                },
                host: async () => {
                    const [quizId] = args
                    const players = new Players(new Avatars)
                    const game = await games.host(quizId, players, events)
                    webSocket.gameId = game.id
                },
                join: () => {
                    const [gameId, name] = args
                    if (games.join(gameId, name, events)) {
                        webSocket.gameId = gameId
                        webSocket.playerName = name
                    }
                },
                nextRound: () => {
                    const [gameId] = args
                    try {
                        const game = games.find(gameId)
                        game.nextRound(events)
                    } catch (error) {
                        console.log(error)
                    }
                },
                guess: () => {
                    const [gameId, name, answerIndex] = args
                    try {
                        const game = games.find(gameId)
                        game.guess(name, answerIndex, events)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }

            const commandHandler = commandHandlers[command]
            commandHandler ? commandHandler() : console.log(`No handler defined for command: ${command}`)
        })

        webSocket.on('close', () => {
            if (!webSocket.gameId || !webSocket.playerName) return
            try {
                const game = games.find(webSocket.gameId)
                game.disconnect(webSocket.playerName, events)
            } catch (error) {
                console.log(error)
            }
        })
    })

    return webSocketServer
}
