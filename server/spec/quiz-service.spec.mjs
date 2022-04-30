'use strict'

import QuizService from '../quiz-service.js'

describe('Quiz service', () => {
    const TEST_DIR = './quizzes'
    const TEST_USER = 'test.user@sap.com'
    const TEST_PUBLIC_QUIZ = 'ase-tdd.json'
    let quizService, quiz

    beforeEach(async () => {
        quizService = new QuizService(TEST_DIR)
        quiz = await quizService.get(TEST_PUBLIC_QUIZ)
    })

    it('returns at least one quiz when getting all quizzes', async () => {
        const all = await quizService.getAll(TEST_USER)
        expect(all.length).toBeGreaterThan(0)
    })

    it('returns zero or more quizzes when getting all private quizzes', async () => {
        const allPrivate = await quizService.getAllPrivate(TEST_USER)
        expect(allPrivate.length).toBeGreaterThanOrEqual(0)
    })

    it('return quiz title when getting public quiz ase-tdd.json', () => {
        expect(quiz.title).toBeDefined()
    })
})
