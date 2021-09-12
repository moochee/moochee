'use strict'
import { WebSocketServer } from 'ws'
import Events from './events.js'
import QuizService from './quiz-service.js'
import Games from './games.js'

// REVISE it's a bit weird that we are emitting events here direcly, but also indirectly through games.js->events.publish
//        maybe it can be consolidated
export default function create(server) {
    const wss = new WebSocketServer({ server })
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }
    const quizService = new QuizService()
    const events = new Events(wss)
    const games = new Games(timer, quizService, events)

    wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            // REVISE why do we need the response variable, can we not just inline?
            //        alternatively, could create a send function that wraps the JSON.stringify
            let response, request = JSON.parse(message)

            if (request.event === 'getQuizzes') {
                const quizzes = await games.getQuizzes()
                response = { event: 'quizzesReceived', args: [quizzes] }
                ws.send(JSON.stringify(response))
            }
            else if (request.event === 'host') {
                const { gameId, quizTitle } = await games.host(...request.args)
                ws.gameId = gameId
                response = { event: 'gameStarted', args: [gameId, quizTitle] }
                ws.send(JSON.stringify(response))
            } else if (request.event === 'join') {
                try {
                    const { quizTitle, name, avatar, otherPlayers } = games.join(...request.args)
                    const gameId = request.args[0]
                    ws.gameId = gameId
                    ws.playerName = name
                    response = { event: 'joiningOk', args: [quizTitle, name, avatar, otherPlayers] }
                    ws.send(JSON.stringify(response))
                } catch (error) {
                    response = { event: 'joiningFailed', args: [error.message] }
                    ws.send(JSON.stringify(response))
                }
            } else if (request.event === 'nextRound') {
                games.nextRound(...request.args)
            } else if (request.event === 'guess') {
                games.guess(...request.args)
            }
        })

        ws.on('close', () => {
            const gameId = ws.gameId
            const name = ws.playerName
            games.disconnect(gameId, name)
        })
    })

    return wss
}