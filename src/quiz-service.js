'use strict'

import { readFile, readdir } from 'fs/promises'

export default function QuizService() {
    const QUIZ_DIR = './quiz/'

    this.getById = async (quizId) => {
        const quizPath = `${QUIZ_DIR}${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    this.getAll = async () => {
        const files = await readdir(QUIZ_DIR)
        let quizzes = []
        for (let file of files) {
            try {
                const quizTitle = (await this.getById(file)).title
                quizzes.push({ id: file, title: quizTitle })
            } catch (error) {
                console.error(file, error)
            }
        }
        return quizzes
    }
}
