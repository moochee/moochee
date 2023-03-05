import { WebSocketServer } from 'ws'
import Events from './events.js'
import Games from './games.js'

export default function create(server, quizService, gameExpiryTimer, historyService) {
    const webSocketServer = new WebSocketServer({ server })
    const events = new Events(webSocketServer, historyService)

    const games = new Games(quizService, events, gameExpiryTimer)
    
    webSocketServer.games = games

    webSocketServer.on('connection', (webSocket) => {

        webSocket.on('message', (message) => {
            const { command, args } = JSON.parse(message)

            const commandHandlers = {
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
                reJoin: () => {
                    const [gameId, name, avatar] = args
                    try {
                        const game = games.get(gameId)
                        if (game.playerExists(name, avatar)) {
                            webSocket.gameId = gameId
                            webSocket.playerName = name
                            webSocket.send(JSON.stringify({ event: 'reJoiningOk', args: [] }))
                        } else {
                            throw new Error('Player does not exist')
                        }
                    } catch (error) {
                        webSocket.send(JSON.stringify({ event: 'reJoiningFailed', args: [error.message] }))
                    }
                },
                joinAsHost: () => {
                    const [gameId] = args
                    try {
                        const game = games.get(gameId)
                        webSocket.gameId = game.id
                        webSocket.send(JSON.stringify({ event: 'hostJoined', args: [game.id, game.quizTitle] }))
                    } catch (error) {
                        console.error(error)
                        webSocket.send(JSON.stringify({ event: 'hostJoinFailed', args: [error.message] }))
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
    })

    return webSocketServer
}
