'use strict'

const GameWrapper = (() => {
    let nextGameId = 100000

    return function Game(quiz, events, avatars) {
        const players = []

        this.id = nextGameId++

        this.join = (name) => {
            if (!name) throw new Error('Player name is empty!')
            if (players.find(p => p.name === name)) throw new Error(`Player ${name} already exists!`)
            if (avatars.size() === 0) throw new Error(`Game reached max. number of players(${players.length})!`)

            const avatar = avatars.pick()
            players.push({ name, avatar, score: 0 })
            const otherPlayers = players.filter(p => p.name !== name).map(p => p.avatar)
            events.publish('playerJoined', this.id, quiz.title, name, avatar, otherPlayers)
        }
    }
})()

export default GameWrapper