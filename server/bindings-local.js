const FakeAuth = function () {
    this.setup = (app) => {
        app.use((req, res, next) => {
            req.isAuthenticated = () => true
            req.user = { id: 'john.doe@acme.org' }
            next()
        })
        return (req, res, next) => {
            next()
        }
    }
}

const auth = new FakeAuth()
const quizzesDir = 'quizzes'
const appUrl = 'http://localhost:3000'
const port = 3000
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = 'history'

export { auth, quizzesDir, appUrl, port, gameExpiryTimer, historyDir }
