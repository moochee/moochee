'use strict'

export default function GamesAdapter(setTimeout, quiz) {
  let nextGameId = 100000
  let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
  const games = []

  this.host = async (quizId) => {
    const gameId = String(nextGameId++)
    const questions = await quiz.getQuestions(quizId)
    const remainingQuestions = questions.map((q, index) => {
      return { sequence: index + 1, text: q.text, answers: q.answers }
    })
    const questionsAndGuesses = questions.map(q => {
        return { text: q.text, rightAnswer: q.rightAnswer, guesses: [] }
    })
    games.push({ id: gameId, remainingQuestions, questionsAndGuesses, players: [] })
    return gameId
  }

  this.join = (gameId, name) => {
    const game = games.find(g => g.id === gameId)
    if (game.players.find( p => p.name === name)) {
      throw new Error('name exists!')
    }
    const avatar = avatars.splice(Math.random() * avatars.length, 1)
    const newPlayer = { name, avatar, score: 0 }
    games.find((g) => g.id === gameId).players.push(newPlayer)
    return newPlayer
  }

  this.nextRound = (gameId) => {
    const game = games.find(g => g.id === gameId)
    const question = game.remainingQuestions.shift()
    const timeToGuess = 20000;
    setTimeout(() => finishRound(gameId), timeToGuess)
    return { question, timeToGuess }
  }

  this.guess = (gameId, questionText, playerName, answer) => {
    const game = games.find(g => g.id === gameId)
    const question = game.questionsAndGuesses.find(q => q.text === questionText)
    //TODO: make sure only 1 answer per player
    question.guesses.push({playerName, answer})

    const score = question.rightAnswer === answer ? 100 : 0
    game.players.find(p => p.name === playerName).score += score

    if (question.guesses.length === game.players.length) {
      return finishRound(gameId)
    } else {
      return {event: '', result: null}
    }
  }

  const finishRound = (gameId) => {
    const game = games.find((g) => g.id === gameId)
    // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
    const result = [...game.players]
    result.sort((a, b) => b.score - a.score)
    if (game.remainingQuestions.length > 0) {
      return {event: 'roundFinished', result}
    } else {
      return {event: 'gameFinished', result}
    }
  }
}