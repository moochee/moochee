'use strict'

import { Server } from 'socket.io'
import EventEmitter from './event-emitter.js'
import QuizRepo from './quiz-repo.js'
import Games from './games.js'

export default function create() {
    const io = new Server()
    const timer = { setTimeout, clearTimeout, secondsToGuess: 20 }
    const quizRepo = new QuizRepo()
    const eventEmitter = new EventEmitter(io)
    const games = new Games(timer, quizRepo, eventEmitter)

    io.on('connection', (socket) => {
        socket.on('getQuizzes', async (callback) => {
            const quizzes = await games.getQuizzes()
            callback(quizzes)
        })

        socket.on('host', async (quizId, callback) => {
            const gameId = await games.host(quizId)
            socket.join(gameId)
            callback(gameId)
        })

        socket.on('join', (gameId, name, callback) => {
            try {
                const avatar = games.join(gameId, name, socket.id)
                socket.join(gameId)
                // REVISE check if we can consistently use the event emitter...
                callback({ avatar })
            } catch (error) {
                callback({ errorMessage: error.message })
            }
        })

        socket.on('nextRound', (gameId) => {
            games.nextRound(gameId)
        })

        socket.on('guess', (gameId, questionText, playerName, answer) => {
            games.guess(gameId, questionText, playerName, answer)
        })

        socket.on('disconnect', () => {
            games.disconnect(socket.id)
        })
    })

    return io
}
