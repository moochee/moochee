export default function HostClient(createWebSocket, origin, timeout = setTimeout) {
    let currentGameId, socket, ready
    const subscribers = {}

    this.host = async (quizId) => {
        const response = await fetch(`${origin}/api/v1/games`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ quizId })
        })
        const targetUrl = new URL(response.headers.get('location'))
        const gameId = targetUrl.pathname.substring(1)
        currentGameId = gameId
        send({ command: 'joinAsHost', args: [gameId] })
    }

    this.nextRound = (gameId) => {
        send({ command: 'nextRound', args: [gameId] })
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
            send({ command: 'joinAsHost', args: [currentGameId] })
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
