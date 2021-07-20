'use strict'
import express from 'express'
const app = express()
import http from 'http'
const server = http.createServer(app)
import { Server } from 'socket.io'
const io = new Server(server)
import GamesAdapter from './games-adapter.js'
import Quiz from './quiz.js'
const quiz = new Quiz()
const adapter = new GamesAdapter(() => null, quiz)

app.use(express.static('public'))

io.on('connection', (socket) => {

  socket.on('getQuizzes', async (callback) => {
    const quizzes = await quiz.getQuizzes()
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
      callback(true)
    } catch (error) {
      callback(false)
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
