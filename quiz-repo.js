'use strict'

import { readFile, readdir } from 'fs/promises'

export default function QuizRepo() {

    const QUIZ_DIR = './quiz/'

    this.getById = async (quizId) => {
        const quizPath = `${QUIZ_DIR}${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    this.getAll = async () => {
        const files = await readdir(QUIZ_DIR)
        let quizzes = []
        for (let file of files) {
            const quizText = (await this.getById(file)).text
            quizzes.push({ id: file, text: quizText })
        }
        return quizzes
    }

}