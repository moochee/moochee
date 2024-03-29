import crypto from 'crypto'
import Players from './players.js'
import Avatars from './avatars.js'

export default function Game(quiz, timer, events, host) {
    let currentQuestionIndex = -1
    let guessTimeoutId
    let roundStartTime
    let players = new Players(new Avatars())
    const DEFAULT_SECONDS_TO_GUESS = 20

    this.id = crypto.randomUUID()
    this.quizTitle = quiz.title

    this.join = (name) => {
        const [avatar, otherPlayers] = players.add(name)
        events.publish(this.id, { event: 'playerJoined', args: [avatar] })
        return [avatar, otherPlayers]
    }

    this.nextRound = () => {
        roundStartTime = new Date()

        players.resetAllGuesses()
        const secondsToGuess = Number(quiz.secondsToGuess) || DEFAULT_SECONDS_TO_GUESS
        const millisecondsToGuess = secondsToGuess * 1000
        guessTimeoutId = timer.setTimeout(() => this.finishRound(question), millisecondsToGuess)

        const question = quiz.questions[++currentQuestionIndex]
        question.answers.sort(() => Math.random() - .5)
        question.answers.forEach(a => a.count = 0)
        const questionWithoutCorrectAnswer = {
            id: currentQuestionIndex + 1, text: question.text,
            answers: question.answers.map(a => ({ text: a.text })),
            totalQuestions: quiz.questions.length
        }
        events.publish(this.id, { event: 'roundStarted', args: [questionWithoutCorrectAnswer, secondsToGuess] })
    }

    this.guess = (name, answerIndex) => {
        if (roundStartTime === null) return

        const question = quiz.questions[currentQuestionIndex]

        const answer = question.answers[answerIndex]
        answer.count += 1

        const responseTime = (new Date() - roundStartTime)
        const score = answer.correct ? Math.round(1000 * Math.pow(0.9, responseTime / 1000)) : 0
        players.addScore(name, score)

        players.guessed(name)
        events.notifyHost(this.id, { event: 'playerGuessed', args: [] })

        if (players.isAllGuessed()) {
            timer.clearTimeout(guessTimeoutId)
            this.finishRound(question)
        }
    }

    const isLastQuestion = () => currentQuestionIndex === quiz.questions.length - 1

    this.finishRound = (result) => {
        if (!roundStartTime) return
        roundStartTime = null

        const scoreboard = [...players.getResult()]
        scoreboard.sort((a, b) => b.score - a.score)
        if (isLastQuestion()) {
            events.publish(this.id, { event: 'gameFinished', args: [{ result, scoreboard }, quiz.title, host ] })
        } else {
            events.publish(this.id, { event: 'roundFinished', args: [{ result, scoreboard }] })
        }
    }
    
    this.playerExists = (name, avatar) => {
        return avatar === players.getAvatar(name)
    }

    // REVISE network layer leaking into business layer
    this.disconnect = (name) => {
        const avatar = players.getAvatar(name)
        players.remove(name)
        if (avatar) events.publish(this.id, { event: 'playerDisconnected', args: [avatar] })
    }
}
