'use strict'

import request from 'supertest'
import httpServer from '../http-server.js'
import dummyConfig from './auth-config/dummy-config.js'
import Auth from '../auth.js'

describe('Server', () => {
    let client

    beforeAll(() => {
        client = request(httpServer(new Auth(dummyConfig)))
    })

    it('protects host page at root by redirecting to login page', () => {
        client.get('/').expect(301)
    })

    it('allows anonymous access to service worker at root', () => {
        client.get('/server-worker.js').expect(200)
    })

    it('allows anonymous access to favicon.ico at root', () => {
        client.get('/favicon.ico').expect(204)
    })

    it('allows anonymous access to play page', () => {
        client.get('/play').expect(200)
    })

    it('allows anonymous access to number of running games', async () => {
        await client.get('/api/v1/runningGames')
            .expect('content-type', /text\/plain/)
            .expect(200)
            .expect(response => expect(response.text).toEqual('0'))
    })
})
