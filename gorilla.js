'use strict'

import express from 'express'
const app = express()
app.use(express.static('public'))

import http from 'http'
const server = http.createServer(app)

import { Server } from 'socket.io'
const io = new Server(server)
import QuizRepo from './quiz-repo.js'
const quizRepo = new QuizRepo()
import Games from './games.js'
const adapter = new Games(() => null, quizRepo)

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
      const newPlayer = adapter.join(gameId, name)
      socket.join(gameId)
      io.to(gameId).emit('playerJoined', gameId, newPlayer)
      callback()
    } catch (error) {
      callback(error.message)
    }
  })
  
  socket.on('nextRound', (gameId) => {
    const {question, timeToGuess} = adapter.nextRound(gameId)
    io.to(gameId).emit('roundStarted', gameId, question, timeToGuess)
  })

  socket.on('guess', (gameId, questionText, playerName, answer) => {
    const {event, result} = adapter.guess(gameId, questionText, playerName, answer)
    if (event) {
      io.to(gameId).emit(event, gameId, result)
    }
  })
})

server.listen(process.env.PORT || 3000, () => {
  console.log('Server started on *:3000')
})
