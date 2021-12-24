'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './auth-config/dummy-config.js'
import Auth from '../auth.js'

const noAuthMiddleware = (req, res, next) => next()
const noAuth = { setup: () => noAuthMiddleware }

describe('Server', () => {
    let client

    // REVISE check if we can find a smarter way or if the test is even valuable enough
    describe('endpoint redirection', () => {
        it('will redirect request with the global url to the instance-specific url', async () => {
            const server = httpServer(null, noAuth, null, 'http://localhost-instance-specific:3001')
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.get('/').expect(302).expect('location', 'http://localhost-instance-specific:3001')
            server.close()
        })

        it('will not redirect request with the instance-specific url', async () => {
            const server = httpServer(null, noAuth, null, 'http://localhost:3001')
            server.listen(3001)
            client = request('http://localhost:3001')
            await client.get('/').expect(200)
            server.close()
        })
    })

    describe('endpoint protection', () => {
        let server

        beforeAll(() => {
            server = httpServer(null, new Auth(dummyConfig), null, 'http://localhost:3001')
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
            server = httpServer(null, noAuth, 'quiz', 'http://localhost:3001')
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
})
