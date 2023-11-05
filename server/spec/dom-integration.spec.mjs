import WebSocket from 'ws'
import { JSDOM, VirtualConsole } from 'jsdom'
import httpServer from '../http-server.js'
import HostClient from '../../web/host/host-client.js'
import PlayerClient from '../../web/play/player-client.js'
import { auth, quizzesDir, gameExpiryTimer } from '../bindings-local.js'
import until from './until.js'
import fetch from 'node-fetch'
import QuizService from '../quiz-service.js'
import dummyQuiz from './dummy/quiz.js'


describe('DOM integration', () => {
    let server, port = 3001, origin = `http://localhost:${port}`, quizService, quizId
    const dummyAuthor = 'test@example.com'
    const noHistory = { create: () => null }

    const createDom = (url) => {
        const virtualConsole = new VirtualConsole()
        const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url, virtualConsole })
        globalThis.WebSocket = WebSocket
        globalThis.document = jsdom.window.document
        globalThis.window = jsdom.window
        globalThis.window.loadCss = () => null
        return jsdom
    }

    beforeEach(async () => {
        quizService = new QuizService(quizzesDir)
        quizId = await quizService.create(dummyQuiz, dummyAuthor)
        server = httpServer(auth, quizService, origin, gameExpiryTimer, noHistory).listen(port)
        globalThis.fetch = fetch
    })

    afterEach(async () => {
        // REVISE the delay is not optimal, I could not find a cleaner way yet: 
        //        Some client code is async and might access window objects or server APIs delayed.
        //        So if the server or window get closed too early, we will see errors.
        await new Promise(resolve => setTimeout(resolve, 150))

        await server.close()

        globalThis.window.close()
        delete globalThis.WebSocket
        delete globalThis.fetch
        delete globalThis.document
        delete globalThis.window
        await quizService.delete(quizId)
    })

    it('can host a game', async () => {
        const playerClient = new PlayerClient(() => new WebSocket(`ws://localhost:${port}`))

        const dom = createDom(origin)
        const init = (await import('../../web/host/main.js')).default
        init(dom.window.document)
        const firstQuiz = await until(() => dom.window.document.getElementsByClassName('quiz')[0])

        const click = new dom.window.MouseEvent('click')
        firstQuiz.dispatchEvent(click)

        const playerInfo = await until(() => dom.window.document.getElementsByClassName('hostWaitingPlayerInfo')[0])
        expect(playerInfo.innerHTML).toMatch('scan the QR code')

        const joinUrl = dom.window.document.getElementsByClassName('hostWaitingJoinUrl')[0].getElementsByTagName('input')[0].value
        const index = joinUrl.indexOf('#/game/') + '#/game/'.length
        const gameId = joinUrl.substring(index)

        // REVISE need to find a better way
        //        if join is triggered too early, the host react component (host.js) has not yet subscribed to the 'playerJoined' event
        //        maybe a good fix could be to move all the event subscribing / game orchestration out of react, or to the "top level" / app component - it might also clean and simplify the react components
        await new Promise(resolve => setTimeout(resolve, 100))
        playerClient.join(gameId, 'Alice')

        await until(() => playerInfo.children.length > 0)
        const avatar = playerInfo.children[0].innerHTML

        dom.window.document.getElementsByClassName('startButton')[0].dispatchEvent(click)

        await until(() => dom.window.document.getElementsByClassName('question')[0])

        playerClient.guess(gameId, 'Alice', 0)

        const transition = await until(() => dom.window.document.getElementsByClassName('transition')[0])

        expect(transition.getElementsByClassName('distribution').length).toBe(1)
        transition.getElementsByTagName('button')[0].dispatchEvent(click)

        const scoreboard = await until(() => dom.window.document.getElementsByClassName('scoreboard')[0])

        expect(scoreboard.innerHTML).toContain(avatar)
    })

    it('can play a game', async () => {
        const hostClient = new HostClient(() => new WebSocket(`ws://localhost:${port}`), origin)

        const gameId = await new Promise(resolve => {
            hostClient.host(quizId)
            hostClient.subscribe('hostJoined', resolve)
        })

        const dom = createDom(`${origin}/play/#/game/${gameId}`)
        const init = (await import('../../web/play/main.js')).default
        init(dom.window.document)

        const join = await until(() => dom.window.document.getElementsByClassName('join')[0])

        const inputPlayerName = new dom.window.InputEvent('input')
        join.getElementsByTagName('input')[0].value = 'alice'
        join.getElementsByTagName('input')[0].dispatchEvent(inputPlayerName)
        // REVISE ewwwwwww
        await new Promise(resolve => setTimeout(resolve, 100))

        const click = new dom.window.MouseEvent('click')
        join.getElementsByTagName('button')[0].dispatchEvent(click)

        const waitingToStart = await until(() => dom.window.document.getElementsByClassName('playWaiting')[0])
        const avatar = waitingToStart.getElementsByClassName('playWaitingAvatar')[0].innerHTML
        expect(avatar).not.toBe('')

        // REVISE ewwwwwww
        await new Promise(resolve => setTimeout(resolve, 100))
        hostClient.nextRound(gameId)

        await until(() => dom.window.document.getElementsByClassName('question')[0])

        dom.window.document.getElementsByClassName('answer')[0].dispatchEvent(click)

        const transition = await until(() => dom.window.document.getElementsByClassName('transition')[0])

        expect(transition.getElementsByClassName('distribution').length).toBe(1)
        transition.getElementsByTagName('button')[0].dispatchEvent(click)

        const scoreboard = await until(() => dom.window.document.getElementsByClassName('scoreboard')[0])

        expect(scoreboard.innerHTML).toContain(avatar)
    })
})