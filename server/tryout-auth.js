'use strict'

export default function TryoutAuth() {
    this.setup = () => {
        return (req, res, next) => {
            if (!req.user) {
                req.isAuthenticated = () => true
                req.user = { id: 'john.doe@acme.org' }
                console.log('req.user.id is set')
            }
            console.log(`req.user.id is ${req.user.id}`)
            next()
        }
    }
}
