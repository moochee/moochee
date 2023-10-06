export default function PlayerClient(createWebSocket, timeout = setTimeout) {
    let currentGameId, currentName, currentAvatar, socket, ready
    const subscribers = {}

    this.join = (gameId, playerName) => {
        currentGameId = gameId
        this.subscribe('joiningOk', (title, name, avatar) => {
            currentName = name
            currentAvatar = avatar
        })
        send({ command: 'join', args: [gameId, playerName] })
    }

    this.guess = (gameId, playerName, answerIndex) => {
        send({ command: 'guess', args: [gameId, playerName, answerIndex] })
    }

    this.subscribe = (event, subscriber) => {
        subscribers[event] = subscribers[event] || []
        subscribers[event].push(subscriber)
    }

    this.unsubscribe = (event) => {
        delete subscribers[event]
    }

    const onMessage = (event) => {
        const message = JSON.parse(event.data)
        const subs = subscribers[message.event] || []
        subs.forEach(sub => sub(...message.args))
    }

    const onClose = () => {
        timeout(() => {
            connect()
            send({ command: 'reJoin', args: [currentGameId, currentName, currentAvatar] })
        }, 1000)
    }

    const connect = () => {
        socket = createWebSocket()
        ready = new Promise(resolve => socket.onopen = resolve)
        socket.onmessage = onMessage
        socket.onclose = onClose
    }

    const send = (msg) => {
        ready.then(() => socket.send(JSON.stringify(msg)))
    }

    connect()
}
