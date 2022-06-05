'use strict'

export default function TryoutAuth() {
    this.setup = () => {
        return (req, res, next) => {
            const referer = req.get('Referer')
            console.log(referer)
            if (referer?.indexOf('tryout') > -1 && !req.user) {
                req.isAuthenticated = () => true
                req.user = { id: 'john.doe@acme.org' }
            }
            next()
        }
    }
}
