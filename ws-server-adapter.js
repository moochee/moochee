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
}