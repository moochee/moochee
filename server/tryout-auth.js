'use strict'

export default function TryoutAuth() {
    this.setup = () => {
        return (req, res, next) => {
            if (!req.user) {
                req.isAuthenticated = () => true
                req.user = { id: 'john.doe@acme.org' }
            }
            next()
        }
    }
}
