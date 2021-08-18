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
            // REVISE I feel 'title' or 'name' might be a more appropriate name than 'text'
            try {
                const quizText = (await this.getById(file)).text
                quizzes.push({ id: file, text: quizText })
            } catch (error) {
                console.error(file, error)
            }
        }
        return quizzes
    }
}
