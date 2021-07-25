'use strict'

import express from 'express'
const app = express()
app.use(express.static('public'))

import http from 'http'
const server = http.createServer(app)

import { Server } from 'socket.io'
const io = new Server(server)
import EventEmitter from './event-emitter.js'
const eventEmitter = new EventEmitter(io)
import QuizRepo from './quiz-repo.js'
const quizRepo = new QuizRepo()
import Games from './games.js'
const adapter = new Games(setTimeout, quizRepo, eventEmitter)

io.on('connection', (socket) => {
  socket.on('getQuizzes', async (callback) => {
    const quizzes = await quizRepo.getAll()
    callback(quizzes)
  })

  socket.on('host', async (quizId, callback) => {
    const gameId = await adapter.host(quizId)
    socket.join(gameId)
    callback(gameId)
  })
  
  socket.on('join', (gameId, name, callback) => {
    try {
      adapter.join(gameId, name, socket.id)
      socket.join(gameId)
      callback()
    } catch (error) {
      callback(error.message)
    }
  })
  
  socket.on('nextRound', (gameId) => {
    adapter.nextRound(gameId)
  })

  socket.on('guess', (gameId, questionText, playerName, answer) => {
    adapter.guess(gameId, questionText, playerName, answer)
  })

  socket.on('disconnect', () => {
    adapter.disconnect(socket.id)
  })
})

server.listen(process.env.PORT || 3000, () => {
  console.log('Server started on *:3000')
})
