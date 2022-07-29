const dummyAuthMiddleware = (req, res, next) => {
    req.isAuthenticated = () => true
    req.user = { id: 'john.doe@acme.org' }
    next()
}

export default { setup: () => dummyAuthMiddleware }
