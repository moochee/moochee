import passport from 'passport'
import session from 'express-session'
import memorystore from 'memorystore'
import OpenIDConnectStrategy from 'passport-openidconnect'

export default function GmailAuth(config) {
    this.setup = (app) => {
        passport.serializeUser(function (user, done) {
            done(null, user)
        })
        passport.deserializeUser(function (user, done) {
            done(null, user)
        })

        const MemoryStore = memorystore(session)
        const twentyFourHours = 86400000
        app.use(session({
            cookie: { maxAge: twentyFourHours },
            store: new MemoryStore({ checkPeriod: twentyFourHours }),
            resave: false,
            saveUninitialized: false,
            secret: config.SESSION_SECRET
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        passport.use(new OpenIDConnectStrategy({
            issuer: 'https://accounts.google.com',
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenURL: 'https://oauth2.googleapis.com/token',
            userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
            scope: 'email profile',
            clientID: config.CLIENT_ID,
            clientSecret: config.CLIENT_SECRET,
            callbackURL: config.REDIRECT_URI
        },
        function verify(issuer, profile, callback) {
            console.log(JSON.stringify(profile))
            return callback(null, profile)
        })
        )

        app.get('/login', passport.authenticate('openidconnect'))

        app.get('/login/callback',
            passport.authenticate('openidconnect', { failureRedirect: '/login', failureMessage: true }),
            (req, res) => res.redirect('/')
        )

        return (req, res, next) => {
            if (req.originalUrl === '/favicon.ico') return res.status(204).end()
            if (!req.isAuthenticated()) {
                req.session.originalUrl = req.originalUrl
                return res.redirect('/login')
            }
            next()
        }
    }
}
