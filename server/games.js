import Game from './game.js'

export default function Games(quizService, events, expiryTimer) {
    let games = []
    let shutdownCallback = null

    const timer = { setTimeout, clearTimeout }

    this.host = async (quizId, host) => {
        const quiz = await quizService.get(quizId)
        const game = new Game(quiz, timer, events, host)
        games.push(game)
        expiryTimer.onTimeout(() => {
            games.splice(games.indexOf(game), 1)
            if (shutdownCallback && games.length === 0) {
                shutdownCallback()
            }
        })
        return game
    }

    this.get = (id) => {
        const game = games.find(g => g.id === id)
        if (!game) {
            throw new Error(`can't find game with id ${id}`)
        }
        return game
    }

    this.onNoRunningGames = (callback) => {
        if (games.length === 0) {
            callback()
        } else {
            shutdownCallback = callback
        }
    }
}
