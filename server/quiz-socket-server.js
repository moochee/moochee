'use strict'

import { WebSocketServer } from 'ws'
import Events from './events.js'
import Games from './games.js'

export default function create(server, quizService) {
    const webSocketServer = new WebSocketServer({ server })
    const events = new Events(webSocketServer)
    const games = new Games(quizService, events)
    webSocketServer.games = games

    webSocketServer.on('connection', (webSocket) => {

        webSocket.on('message', (message) => {
            const { command, args } = JSON.parse(message)

            const commandHandlers = {
                host: async () => {
                    const [quizId] = args
                    const game = await games.host(quizId)
                    webSocket.gameId = game.id
                    webSocket.send(JSON.stringify({ event: 'gameStarted', args: [game.id, game.quizTitle] }))
                },
                join: () => {
                    const [gameId, name] = args
                    try {
                        const game = games.get(gameId)
                        const [avatar, otherPlayers] = game.join(name)
                        webSocket.gameId = gameId
                        webSocket.playerName = name
                        webSocket.send(JSON.stringify({ event: 'joiningOk', args: [game.quizTitle, name, avatar, otherPlayers] }))
                    } catch (error) {
                        webSocket.send(JSON.stringify({ event: 'joiningFailed', args: [error.message] }))
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
                        const game = games.get(gameId)
                        game.nextRound()
                    } catch (error) {
                        console.error(error)
                    }
                },
                guess: () => {
                    const [gameId, name, answerIndex] = args
                    try {
                        const game = games.get(gameId)
                        game.guess(name, answerIndex)
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
                const game = games.get(webSocket.gameId)
                game.disconnect(webSocket.playerName, events)
            } catch (error) {
                console.error(error)
            }
        })
    })

    return webSocketServer
}
