'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './auth-config/dummy-config.js'
import GoogleAuth from '../google-auth.js'
import QuizService from '../quiz-service.js'
import dummyQuiz from './quiz/dummy-quiz.js'

const noAuthMiddleware = (req, res, next) => next()
const noAuth = { setup: () => noAuthMiddleware }
const noExpiryTimer = { onTimeout: () => null }
const dummyDirectory = 'quizzes'

describe('Server', () => {
    let client, quizService, quizId

    // REVISE check if we can find a smarter way or if the test is even valuable enough
    describe('endpoint redirection', () => {
        let server

        afterEach(() => {
            server.close()
        })

        it('will redirect request with the global url to the instance-specific url', async () => {
            server = httpServer(null, noAuth, null, 'http://localhost-instance-specific:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001/?test')
            await client.get('/').expect(302).expect('location', 'http://localhost-instance-specific:3001/?test/')
        })

        it('will not redirect request with the instance-specific url', async () => {
            server = httpServer(null, noAuth, null, 'http://localhost:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001/?test')
            await client.get('/').expect(200)
        })
    })

    describe('endpoint protection', () => {
        let server

        beforeAll(() => {
            server = httpServer(null, new GoogleAuth(dummyConfig), null, 'http://localhost:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
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
        let server

        beforeAll(async () => {
            server = httpServer(null, noAuth, dummyDirectory, 'http://localhost:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            quizService = new QuizService(dummyDirectory)
            quizId = await quizService.create(dummyQuiz, 'test@example.com')
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

    describe('server shutdown', () => {
        let server
        afterEach(() => server.close())

        beforeAll(async () => {
            quizService = new QuizService(dummyDirectory)
            quizId = await quizService.create(dummyQuiz, 'test@example.com')
        })

        afterAll(async () => {
            await quizService.delete(quizId)
        })

        it('will delay shutdown until all games are finished', async () => {
            const stopClientFake = {
                stop: () => server.close()
            }
            const gameExpiryTimer = {
                callback: null,
                onTimeout: function (cb) {
                    this.callback = cb
                }
            }
            server = httpServer(stopClientFake, noAuth, dummyDirectory, 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId }).expect(201)
            await client.post('/api/v1/stop').expect(202)
            await client.get('/api/v1/status').expect(200)
            gameExpiryTimer.callback()
            try {
                await client.get('/api/v1/status').expect(200)
                fail('should not be successful')
            } catch (error) {
                expect(error.message).toMatch(/ECONNREFUSED/u)
            }
        })

        it('will not shutdown when not requested, even when all games are finished', async () => {
            const stopClientFake = {
                stop: () => server.close()
            }
            // REVISE see if it is simpler using jasmine.clock, like in games.spec, so we don't need injection through multiple classes
            const gameExpiryTimer = {
                callback: null,
                onTimeout: function (cb) {
                    this.callback = cb
                }
            }
            server = httpServer(stopClientFake, noAuth, dummyDirectory, 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId }).expect(201)
            await client.get('/api/v1/status').expect(200)
            gameExpiryTimer.callback()
            await client.get('/api/v1/status').expect(200)
        })

        it('will not shutdown when requested, when there are still remaining games', async () => {
            const stopClientFake = {
                stop: () => {
                    server.close()
                }
            }
            // REVISE see if it is simpler using jasmine.clock, like in games.spec, so we don't need injection through multiple classes
            const gameExpiryTimer = {
                callbacks: [],
                onTimeout: function (cb) {
                    this.callbacks.push(cb)
                }
            }
            server = httpServer(stopClientFake, noAuth, dummyDirectory, 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId }).expect(201)
            await client.post('/api/v1/games').send({ quizId }).expect(201)
            expect(gameExpiryTimer.callbacks.length).toBe(2)
            await client.post('/api/v1/stop').expect(202)
            await client.get('/api/v1/status').expect(200)
            gameExpiryTimer.callbacks[0]()
            await client.get('/api/v1/status').expect(200)
        })
    })
})
