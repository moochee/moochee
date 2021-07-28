'use strict'

import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import EventEmitter from './event-emitter.js'
import QuizRepo from './quiz-repo.js'
import Games from './games.js'

const app = express()
app.use(express.static('public'))

const server = http.createServer(app)

const io = new Server(server)
const timer = { setTimeout, clearTimeout }
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
            games.join(gameId, name, socket.id)
            socket.join(gameId)
            callback()
        } catch (error) {
            callback(error.message)
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

const listener = server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on *:${listener.address().port}`)
})
