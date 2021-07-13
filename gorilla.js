'use strict'
import express from 'express'
const app = express()
import http from 'http'
const server = http.createServer(app)
import { Server } from 'socket.io'
const io = new Server(server)

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('a user connected')
})

server.listen(3000, () => {
  console.log('Server started on *:3000')
})
