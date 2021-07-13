'use strict'
import express from 'express'
const app = express()
import http from 'http'
const server = http.createServer(app)
import { Server } from 'socket.io'
const io = new Server(server)
import WsServerAdapter from './ws-server-adapter.js'
import questions from './questions.js'
const wsAdapter = new WsServerAdapter(() => null, questions)

app.use(express.static('public'))

io.on('connection', (socket) => {
  socket.on('host', (callback) => {
    const gameId = wsAdapter.host()
    socket.join(gameId)
    callback(gameId)
  })
  socket.on('join', (gameId, name) => {
    const newPlayer = wsAdapter.join(gameId, name)
    socket.join(gameId)
    io.to(gameId).emit('playerJoined', gameId, newPlayer)
  })
})

server.listen(3000, () => {
  console.log('Server started on *:3000')
})
