export default function Players(avatars) {
    let players = []

    this.add = (name) => {
        if (!name) throw new Error('Player name is empty!')
        if (players.find(p => p.name === name)) throw new Error(`Player ${name} already exists!`)
        if (avatars.size() === 0) throw new Error(`Game reached max. number of players(${players.length})!`)

        const avatar = avatars.pick()
        players.push({ name, avatar, score: 0, guessed: false })
        const otherPlayers = players.filter(p => p.name !== name).map(p => p.avatar)
        return [avatar, otherPlayers]
    }

    this.getAvatar = (name) => {
        const player = players.find(p => p.name === name)
        return player ? player.avatar : null
    }

    this.remove = (name) => {
        players = players.filter(p => p.name !== name)
    }

    this.addScore = (name, score) => {
        const player = players.find(p => p.name === name)
        if (player) player.score += score
    }

    this.getResult = () => {
        return players
    }

    this.guessed = (name) => {
        const player = players.find(p => p.name === name)
        if (player) player.guessed = true
    }

    this.isAllGuessed = () => {
        return players.filter(p => p.guessed === false).length === 0
    }

    this.resetAllGuesses = () => {
        players.forEach(p => p.guessed = false)
    }
}
