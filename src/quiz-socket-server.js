'use strict'

import Events from './events.js'
import QuizRepo from './quiz-repo.js'
import Games from './games.js'

export default function create(uWS) {
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }
    const quizRepo = new QuizRepo()
    const events = new Events(uWS)
    const games = new Games(timer, quizRepo, events)
    const decoder = new TextDecoder('utf-8')

    const server = {
        idleTimeout: 28,
        maxBackpressure: 1024,
        maxPayloadLength: 512,
        compression: uWS.DEDICATED_COMPRESSOR_3KB,
        message: async (socket, message, isBinary) => {
            let response, request = JSON.parse(decoder.decode(message))

            if (request.event === 'getQuizzes') {
                const quizzes = await games.getQuizzes()
                response = { event: 'quizzesReceived', args: [quizzes] }
                socket.send(JSON.stringify(response), isBinary, true)
            }
            else if (request.event === 'host') {
                const { gameId, quizTitle } = await games.host(...request.args)
                socket.subscribe(gameId)
                response = { event: 'gameStarted', args: [gameId, quizTitle] }
                socket.send(JSON.stringify(response), isBinary, true)
            } else if (request.event === 'join') {
                try {
                    const { quizTitle, name, avatar, otherPlayers } = games.join(...request.args)
                    const gameId = request.args[0]
                    socket.subscribe(gameId)
                    socket['gameId'] = gameId
                    socket['playerName'] = name
                    response = { event: 'joiningOk', args: [quizTitle, name, avatar, otherPlayers] }
                    socket.send(JSON.stringify(response), isBinary, true)
                } catch (error) {
                    response = { event: 'joiningFailed', args: [error.message] }
                    socket.send(JSON.stringify(response), isBinary, true)
                }
            } else if (request.event === 'nextRound') {
                games.nextRound(...request.args)
            } else if (request.event === 'guess') {
                games.guess(...request.args)
            }
        },
        close: (socket) => {
            const gameId = socket['gameId']
            const name = socket['playerName']
            games.disconnect(gameId, name)
        }
    }

    return server
}
