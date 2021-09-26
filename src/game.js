'use strict'

const GameWrapper = (() => {
    let nextGameId = 100000
    let roundStartTime
    const NETWORK_DELAY_IN_SECONDS = 2

    // TODO: extract another class Quiz
    return function Game(quiz, events, players, timer) {
        let currentQuestionIndex = -1
        let guessTimeoutId

        this.id = nextGameId++

        this.join = (name) => {
            const [avatar, otherPlayers] = players.add(name)
            events.publish('playerJoined', this.id, quiz.title, name, avatar, otherPlayers)
        }

        this.nextRound = () => {
            // TODO: may need to save round result before moving to next round (or do it in finishRound)
            players.resetAllGuesses()
            const question = quiz.questions[++currentQuestionIndex]
            const questionWithoutCorrectAnswer = { text: question.text, answers: question.answers.map(a => ({ text: a.text })) }
            events.publish('roundStarted', this.id, questionWithoutCorrectAnswer)
            const timeToGuess = (timer.secondsToGuess + NETWORK_DELAY_IN_SECONDS) * 1000
            guessTimeoutId = timer.setTimeout(() => this.finishRound(question), timeToGuess)
            roundStartTime = new Date()
        }

        this.guess = (name, answerIndex) => {
            const question = quiz.questions[currentQuestionIndex]

            const answer = question.answers[answerIndex]
            answer.count = (answer.count || 0) + 1

            const responseTime = (new Date() - roundStartTime) - NETWORK_DELAY_IN_SECONDS * 1000
            const score = answer.correct ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
            players.addScore(name, score)

            players.guessed(name)
            if (players.isAllGuessed()) {
                timer.clearTimeout(guessTimeoutId)
                this.finishRound(question)
            }
        }

        this.finishRound = (result) => {
            roundStartTime = null
            const scoreboard = [...players.getResult()]
            scoreboard.sort((a, b) => b.score - a.score)
            if (currentQuestionIndex === quiz.questions.length - 1) {
                events.publish('gameFinished', this.id, { result, scoreboard })
            } else {
                events.publish('roundFinished', this.id, { result, scoreboard })
            }
        }

        this.disconnect = (name) => {
            const avatar = players.remove(name)
            if (avatar) events.publish('playerDisconnected', this.id, avatar)
        }
    }
})()

export default GameWrapper