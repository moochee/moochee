'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './auth-config/dummy-config.js'
import Auth from '../auth.js'

describe('Server', () => {
    let client

    describe('endpoint protection', () => {
        beforeAll(() => {
            client = request(httpServer(new Auth(dummyConfig)))
        })

        it('protects host page at root by redirecting to login page', async () => {
            await client.get('/').expect(302)
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
        beforeAll(() => {
            const noAuthMiddleware = (req, res, next) => next()
            const noAuth = { setup: () => noAuthMiddleware }
            client = request(httpServer(noAuth))
        })

        it('supports creating a new game', async () => {
            await client.post('/api/v1/games').expect(201)
        })
    })
})
