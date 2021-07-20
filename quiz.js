'use strict'

import { readFile, readdir } from 'fs/promises'

export default function Quiz() {

  const QUIZ_DIR = './quiz/'

  this.getQuestions = async (quizId) => {
    const quizPath = `${QUIZ_DIR}${quizId}`
    return JSON.parse(await readFile(quizPath, 'utf8')).questions
  }

  this.getText = async (quizId) => {
    const quizPath = `${QUIZ_DIR}${quizId}`
    return JSON.parse(await readFile(quizPath, 'utf8')).text
  }

  this.getQuizzes = async () => {
    const files = await readdir(QUIZ_DIR)
    let quizzes = []
    for (let file of files) {
      const quizText = await this.getText(file)
      quizzes.push({id: file, text: quizText})
    }
    return quizzes
  }

}