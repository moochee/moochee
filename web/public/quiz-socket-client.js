export default function QuizSocketClient(createWebSocket, createGame, timeout = setTimeout, isPlayerClient) {
    let socket = createWebSocket()
    let ready = new Promise((resolve) => socket.onopen = resolve)
    let currentGameId, currentQuizTitle, name, avatar

    const subscribers = {}

    const notify = (event, args) => {
        const subs = subscribers[event]
        if (subs) {
            subs.forEach(sub => sub(...args))
        }
    }

    const onMessage = (event) => {
        const message = JSON.parse(event.data)
        notify(message.event, message.args)
    }

    const onClose = () => {
        timeout(() => {
            ready = new Promise(resolve => {
                socket = createWebSocket()
                socket.onopen = resolve
                socket.onmessage = onMessage
                socket.onclose = onClose
            })
            if (isPlayerClient) {
                send({ command: 'reJoin', args: [currentGameId, name, avatar] })
            } else {
                if (currentGameId) {
                    send({ command: 'joinAsHost', args: [currentGameId, currentQuizTitle] })
                }
            }
        }, 1000)
    }

    socket.onmessage = onMessage
    socket.onclose = onClose

    this.subscribe = (event, subscriber) => {
        if (!subscribers[event]) {
            subscribers[event] = []
        }
        subscribers[event].push(subscriber)
    }

    this.unsubscribe = (event) => {
        delete subscribers[event]
    }

    const send = (msg) => {
        ready.then(() => socket.send(JSON.stringify(msg)))
    }

    this.host = async (quizId, quizTitle) => {
        const gameId = await createGame(quizId)
        currentGameId = gameId
        currentQuizTitle = quizTitle
        send({ command: 'joinAsHost', args: [gameId, quizTitle] })
    }

    this.join = (gameId, playerName) => {
        currentGameId = gameId
        this.subscribe('joiningOk', (title, n, a) => {
            name = n
            avatar = a
        })
        send({ command: 'join', args: [gameId, playerName] })
    }

    this.nextRound = (gameId) => {
        send({ command: 'nextRound', args: [gameId] })
    }

    this.guess = (gameId, playerName, answerIndex) => {
        send({ command: 'guess', args: [gameId, playerName, answerIndex] })
    }
}
