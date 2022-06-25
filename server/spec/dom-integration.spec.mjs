import WebSocket from 'ws'
import { JSDOM, VirtualConsole } from 'jsdom'
import httpServer from '../http-server.js'
import { appStopper, auth, privateQuizzesDir, dedicatedOrigin, port, gameExpiryTimer } from '../local-bindings.js'
import until from './until.js'
import fetch from 'node-fetch'

describe('DOM integration', () => {
    let document, server

    beforeEach(async () => {
        server = httpServer(appStopper, auth, privateQuizzesDir, dedicatedOrigin, gameExpiryTimer)
        server.listen(port)

        const virtualConsole = new VirtualConsole()
        virtualConsole.on('error', () => null)
        const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: dedicatedOrigin, virtualConsole })
        globalThis.WebSocket = WebSocket
        globalThis.fetch = fetch
        globalThis.self = globalThis
        globalThis.document = jsdom.window.document
        globalThis.window = jsdom.window
        globalThis.window.loadCss = () => null
        const init = (await import('../../web/host/main.js')).default
        init(jsdom.window.document)
        document = jsdom.window.document
    })

    afterEach(async () => {
        await server.close()

        globalThis.window.close()
        delete globalThis.WebSocket
        delete globalThis.fetch
        delete globalThis.self
        delete globalThis.document
        delete globalThis.window
    })

    it('can host a new game', async () => {
        const firstQuiz = await until(() => document.getElementsByClassName('quiz')[0])

        let event = document.createEvent('HTMLEvents')
        event.initEvent('click', false, true)
        firstQuiz.dispatchEvent(event)

        const playerInfo = await until(() => document.getElementsByClassName('hostWaitingPlayerInfo')[0])
        expect(playerInfo.innerHTML).toMatch('scan the QR code')

        return new Promise(resolve => setTimeout(resolve, 150))
    })
})
