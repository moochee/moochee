'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './auth-config/dummy-config.js'
import Auth from '../auth.js'

const noAuthMiddleware = (req, res, next) => next()
const noAuth = { setup: () => noAuthMiddleware }
const noExpiryTimer = { onTimeout: () => null }

describe('Server', () => {
    let client

    // REVISE check if we can find a smarter way or if the test is even valuable enough
    describe('endpoint redirection', () => {
        it('will redirect request with the global url to the instance-specific url', async () => {
            const server = httpServer(null, noAuth, null, 'http://localhost-instance-specific:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.get('/').expect(302).expect('location', 'http://localhost-instance-specific:3001')
            server.close()
        })

        it('will not redirect request with the instance-specific url', async () => {
            const server = httpServer(null, noAuth, null, 'http://localhost:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.get('/').expect(200)
            server.close()
        })
    })

    describe('endpoint protection', () => {
        let server

        beforeAll(() => {
            server = httpServer(null, new Auth(dummyConfig), null, 'http://localhost:3001', noExpiryTimer)
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

        it('allows anonymous access to service worker at root', async () => {
            await client.get('/service-worker.js').expect(200)
        })

        it('allows anonymous access to favicon.ico at root', async () => {
            await client.get('/favicon.ico').expect(204)
        })

        it('allows anonymous access to play page', async () => {
            await client.get('/play/').expect(200)
        })

        it('allows anonymous access to number of running games', async () => {
            await client.get('/api/v1/runningGames')
                .expect('content-type', /text\/plain/)
                .expect(200)
                .expect(response => expect(response.text).toEqual('0'))
        })
    })

    describe('game API', () => {
        let server

        beforeAll(() => {
            server = httpServer(null, noAuth, 'quiz', 'http://localhost:3001', noExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
        })

        afterAll(() => {
            server.close()
        })

        it('supports creating a new game', async () => {
            // REVISE maybe it's better to make it a unit test, i.e. inject some dummy 'games' or 'quizService'
            const response = await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' })
                .expect(201).expect('Location', /.+/)
            const url = new URL(response.headers['location'])
            expect(url.hostname).toEqual('localhost')
            expect(url.pathname).toMatch(/\/.+/)
        })
    })

    describe('server shutdown', () => {
        let server
        afterEach(() => server.close())
        // xit('will delay shutdown until all games are finished', async () => {
        //     // TODO make the timeout configurable, ie inject something we can control to expire a game
        //     const stopClientSpy = {
        //         stopped: false,
        //         stop: function () {
        //             this.stopped = true
        //         }
        //     }
        //     server = httpServer(stopClientSpy, noAuth, 'quiz', 'http://localhost:3001')
        //     server.listen(3001)
        //     client = request('http://localhost:3001')
        //     await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' }).expect(201)
        //     await client.post('/api/v1/stop').expect(202)
        //     expect(stopClientSpy.stopped).toBeFalse()
        //     // TODO expire game, server should stop
        //     expect(stopClientSpy.stopped).toBeTrue()
        // })

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
            server = httpServer(stopClientFake, noAuth, 'quiz', 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' }).expect(201)
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
            server = httpServer(stopClientFake, noAuth, 'quiz', 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' }).expect(201)
            await client.get('/api/v1/status').expect(200)
            gameExpiryTimer.callback()
            await client.get('/api/v1/status').expect(200)
        })

        it('will not shutdown when requested, when there are still remaining games', async () => {
            const stopClientFake = {
                stop: () => {
                    console.log('stopping server')
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
            server = httpServer(stopClientFake, noAuth, 'quiz', 'http://localhost:3001', gameExpiryTimer)
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' }).expect(201)
            await client.post('/api/v1/games').send({ quizId: 'cc-dist-logging.json' }).expect(201)
            expect(gameExpiryTimer.callbacks.length).toBe(2)
            await client.post('/api/v1/stop').expect(202)
            await client.get('/api/v1/status').expect(200)
            gameExpiryTimer.callbacks[0]()
            await client.get('/api/v1/status').expect(200)
        })
    })
})
