'use strict'

import request from 'supertest'
import createServer from '../create-server.js'
import dummyConfig from './dummy-config.js'

describe('Server', () => {
    let client

    beforeAll(() => {
        client = request(createServer(dummyConfig))
    })

    it('protects host page at root by redirecting to login page', () => {
        client.get('/').expect(301)
    })

    it('allows anonymous access to service worker at root', () => {
        client.get('/server-worker.js').expect(200)
    })

    it('allows anonymous access to play page', () => {
        client.get('/play').expect(200)
    })

    it('allows anonymous access to number of running games', async () => {
        const response = await client.get('/api/v1/runningGames')
            .expect('content-type', /text\/plain/)
            .expect(200)
        expect(response.text).toEqual('0')
    })
})