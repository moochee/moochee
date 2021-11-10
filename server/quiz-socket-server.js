'use strict'

import { WebSocketServer } from 'ws'
import Events from './events.js'

export default function create(server, games) {
    const webSocketServer = new WebSocketServer({ server })

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
                    const game = await games.host(quizId, events)
                    webSocket.gameId = game.id
                },
                join: () => {
                    const [gameId, name] = args
                    if (games.join(gameId, name, events)) {
                        webSocket.gameId = gameId
                        webSocket.playerName = name
                    }
                },
                joinAsHost: () => {
                    const [gameId] = args
                    webSocket.gameId = gameId
                    webSocket.send(JSON.stringify({ event: 'hostJoined', args: [] }))
                },
                nextRound: () => {
                    const [gameId] = args
                    try {
                        const game = games.find(gameId)
                        game.nextRound(events)
                    } catch (error) {
                        console.error(error)
                    }
                },
                guess: () => {
                    const [gameId, name, answerIndex] = args
                    try {
                        const game = games.find(gameId)
                        game.guess(name, answerIndex, events)
                    } catch (error) {
                        console.error(error)
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
                console.error(error)
            }
        })
    })

    return webSocketServer
}
