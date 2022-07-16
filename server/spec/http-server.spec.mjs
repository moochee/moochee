'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './dummy/auth-config.js'
import GoogleAuth from '../google-auth.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'
import dummyAuth from './dummy/auth.js'

const noExpiryTimer = { onTimeout: () => null }
const dummyDirectory = 'quizzes'

describe('Server', () => {
    let server, client, quizService, quizId, port, url

    describe('endpoint protection', () => {

        beforeAll(() => {
            port = 3001
            url = `http://localhost:${port}`
            server = httpServer(null, new GoogleAuth(dummyConfig), { dir: '' }, url, noExpiryTimer, null)
            server.listen(port)
            client = request(url)
        })

        afterAll(() => {
            server.close()
        })

        it('protects host page at root by redirecting to login page', async () => {
            await client.get('/').expect(302).expect('location', '/login')
        })

        it('protects game API page at root by redirecting to login page', async () => {
            await client.get('/api/v1/games').expect(302)
        })

        it('allows anonymous access to favicon.ico at root', async () => {
            await client.get('/favicon.ico').expect(204)
        })

        it('allows anonymous access to play page', async () => {
            await client.get('/play/').expect(200)
        })
    })

    describe('game API', () => {

        beforeAll(async () => {
            quizService = new QuizService(dummyDirectory)
            quizId = await quizService.create(dummyQuiz, 'test@example.com')
            port = 3002
            url = `http://localhost:${port}`
            server = httpServer(null, dummyAuth, quizService, url, noExpiryTimer, null)
            server.listen(port)
            client = request(url)
        })

        afterAll(async () => {
            await quizService.delete(quizId)
            server.close()
        })

        it('supports creating a new game', async () => {
            // REVISE maybe it's better to make it a unit test, i.e. inject some dummy 'games' or 'quizService'
            const response = await client.post('/api/v1/games').send({ quizId })
                .expect(201).expect('Location', /.+/)
            const url = new URL(response.headers['location'])
            expect(url.hostname).toEqual('localhost')
            expect(url.pathname).toMatch(/\/.+/)
        })
    })
})
