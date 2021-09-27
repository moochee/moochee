'use strict'

function Game(quiz, events, players, timer) {
    let currentQuestionIndex = -1
    let guessTimeoutId
    let roundStartTime
    const NETWORK_DELAY_IN_SECONDS = 2

    this.id = String(Game.nextGameId++)

    this.join = (name) => {
        const [avatar, otherPlayers] = players.add(name)
        events.publish('playerJoined', this.id, avatar)
        return { quizTitle: quiz.title, avatar, otherPlayers }
    }

    this.nextRound = () => {
        // TODO: may need to save round result before moving to next round (or do it in finishRound)
        players.resetAllGuesses()
        const question = quiz.questions[++currentQuestionIndex]
        question.answers.forEach(a => a.count = 0)
        const questionWithoutCorrectAnswer = {
            id: currentQuestionIndex + 1, text: question.text,
            answers: question.answers.map(a => ({ text: a.text })),
            totalQuestions: quiz.questions.length
        }
        events.publish('roundStarted', this.id, questionWithoutCorrectAnswer, timer.secondsToGuess)
        const timeToGuess = (timer.secondsToGuess + NETWORK_DELAY_IN_SECONDS) * 1000
        guessTimeoutId = timer.setTimeout(() => this.finishRound(question), timeToGuess)
        roundStartTime = new Date()
    }

    this.guess = (name, answerIndex) => {
        const question = quiz.questions[currentQuestionIndex]

        const answer = question.answers[answerIndex]
        answer.count += 1

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

Game.nextGameId = 100000

export default Game