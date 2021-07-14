'use strict'

export default function WsServerAdapter(setTimeout, questions) {
  let nextGameId = 100000
  let avatars = Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🦉🐴🦄🐝🐛🦋🐌🐞🐜🦂🐢🐍🦎🦖🐙🦀🐠🐬🐳🦈🦭🐊🦧🦍🦣🐘🦏🐫🦒🦬🐿🦔🦡🐲')
  const games = []

  // REVISE just checking - why do we need to map the whole thing, can't we just do it on the fly in "nextRound"
  const questionsWithoutRightAnswer = questions.map((q, index) => {
    return { sequence: index + 1, text: q.text, answers: q.answers }
  })

  this.host = () => {
    const gameId = String(nextGameId++)
    const questionsAndGuesses = questions.map(q => {
        return { text: q.text, rightAnswer: q.rightAnswer, guesses: [] }
    })
    games.push({ id: gameId, questions: questionsAndGuesses, players: [] })
    return gameId
  }

  this.join = (gameId, name) => {
    const avatar = avatars.splice(Math.random() * avatars.length, 1)
    const newPlayer = { name, avatar, score: 0 }
    games.find((g) => g.id === gameId).players.push(newPlayer)
    return newPlayer
  }

  this.nextRound = (gameId) => {
    const question = questionsWithoutRightAnswer.shift()
    const timeToGuess = 20000;
    setTimeout(() => finishRound(gameId), timeToGuess)
    return { question, timeToGuess }
  }

  this.guess = (gameId, questionText, playerName, answer) => {
    const game = games.find(g => g.id === gameId)

    const question = game.questions.find(q => q.text === questionText)
    //TODO: make sure only 1 answer per player
    question.guesses.push({playerName, answer})

    const score = question.rightAnswer === answer ? 100 : 0
    game.players.find(p => p.name === playerName).score += score

    if (question.guesses.length === game.players.length) {
      return finishRound(gameId)
    } else {
      return {event: 'roundInProgress', result: null}
    }
  }

  const finishRound = (gameId) => {
    const game = games.find((g) => g.id === gameId)
    // TODO implement "player is on fire", e.g. when climbed 3 times, or guessed right 3 times, or ...
    const result = [...game.players]
    result.sort((a, b) => b.score - a.score)
    const hasSameScoreAsPrevious = (index) => (index > 0) && (result[index].score === result[index - 1].score)
    result.forEach((p, index) => p.rank = hasSameScoreAsPrevious(index) ? index : index + 1)
    if (questionsWithoutRightAnswer.length > 0) {
      return {event: 'roundFinished', result}
    } else {
      return {event: 'gameFinished', result}
    }
  }
}