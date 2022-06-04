'use strict'

export default function FakeAuth() {
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
