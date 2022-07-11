'use strict'

import { WebSocketServer } from 'ws'
import Events from './events.js'
import Games from './games.js'

export default function create(server, quizService, gameExpiryTimer, historyDir) {
    const webSocketServer = new WebSocketServer({ server })
    const events = new Events(webSocketServer, historyDir)

    const games = new Games(quizService, events, gameExpiryTimer)
    
    webSocketServer.games = games

    webSocketServer.on('connection', (webSocket) => {

        webSocket.on('message', (message) => {
            const { command, args } = JSON.parse(message)

            const commandHandlers = {
                joinAsHost: () => {
                    const [gameId, quizTitle] = args
                    webSocket.gameId = gameId
                    webSocket.send(JSON.stringify({ event: 'gameStarted', args: [gameId, quizTitle] }))
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
            commandHandler ? commandHandler() : console.error(`No handler defined for command: ${command}`)
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
