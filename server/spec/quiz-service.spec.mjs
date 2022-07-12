'use strict'

import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'

const dummyDirectory = 'quizzes'
const dummyAuthor = 'test@example.com'


describe('Quiz service', () => {

    let quizService, quizId

    beforeAll(async () => {
        quizService = new QuizService(dummyDirectory)
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
    })

    afterAll(async () => {
        await quizService.delete(quizId)
    })

    it('returns at least one quiz when getting all quizzes', async () => {
        const all = await quizService.getAll(dummyAuthor)
        expect(all.length).toBeGreaterThan(0)
    })

    it('returns zero or more quizzes when getting all mine quizzes', async () => {
        const myQuizzes = await quizService.getAllMine(dummyAuthor)
        expect(myQuizzes.length).toBeGreaterThanOrEqual(0)
    })

    it('returns quiz title when getting an existing quiz', async () => {
        const quiz = await quizService.get(quizId)
        expect(quiz.title).toBeDefined()
    })
})
