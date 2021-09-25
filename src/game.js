'use strict'

const GameWrapper = (() => {
    let nextGameId = 100000
    let roundStartTime
    const NETWORK_DELAY_IN_SECONDS = 2

    return function Game(quiz, events, avatars) {
        const players = []
        let currentQuestionIndex = 0

        this.id = nextGameId++

        this.join = (name) => {
            if (!name) throw new Error('Player name is empty!')
            if (players.find(p => p.name === name)) throw new Error(`Player ${name} already exists!`)
            if (avatars.size() === 0) throw new Error(`Game reached max. number of players(${players.length})!`)

            const avatar = avatars.pick()
            players.push({ name, avatar, score: 0, guessed: false })
            const otherPlayers = players.filter(p => p.name !== name).map(p => p.avatar)
            events.publish('playerJoined', this.id, quiz.title, name, avatar, otherPlayers)
        }

        this.nextRound = () => {
            const question = quiz.questions[currentQuestionIndex]
            const questionWithoutCorrectAnswer = { text: question.text, answers: question.answers.map(a => ({ text: a.text })) }
            events.publish('roundStarted', this.id, questionWithoutCorrectAnswer)
            // const timeToGuess = (timer.secondsToGuess + NETWORK_DELAY_IN_SECONDS) * 1000
            // guessTimeoutId = timer.setTimeout(() => finishRound(question), timeToGuess)
            roundStartTime = new Date()
        }

        this.guess = (name, answerIndex) => {
            const question = quiz.questions[currentQuestionIndex]
            const answer = question.answers[answerIndex]
            answer.count = (answer.count || 0) + 1

            const responseTime = (new Date() - roundStartTime) - NETWORK_DELAY_IN_SECONDS * 1000
            const score = answer.correct ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
            const player = players.find(p => p.name === name)
            player.score += score
            player.guessed = true

            if (this.allPlayersGuessed(players)) {
                //timer.clearTimeout(guessTimeoutId)
                this.finishRound(question)
            }
        }

        this.allPlayersGuessed = (players) => { return players.filter(p => p.guessed === false).length === 0 }

        this.finishRound = (result) => {
            roundStartTime = null
            const scoreboard = [...players]
            scoreboard.sort((a, b) => b.score - a.score)
            if (currentQuestionIndex < quiz.questions.length - 1) {
                events.publish('roundFinished', this.id, { result, scoreboard })
            } else {
                events.publish('gameFinished', this.id, { result, scoreboard })
            }
        }
    }
})()

export default GameWrapper