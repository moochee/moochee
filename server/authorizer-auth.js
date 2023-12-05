import passport from 'passport'
import session from 'express-session'
import memorystore from 'memorystore'
import { Issuer, Strategy } from 'openid-client'

export default function AuthorizerAuth(config) {
    this.setup = async (app) => {
        const OPENID_CONNECT = 'oidc'

        passport.serializeUser(function (user, done) {
            done(null, user)
        })
        passport.deserializeUser(function (user, done) {
            done(null, user)
        })

        const MemoryStore = memorystore(session)
        const twentyFourHours = 24 * 60 * 60 * 1000
        app.use(session({
            cookie: { maxAge: twentyFourHours },
            store: new MemoryStore({ checkPeriod: twentyFourHours }),
            resave: false,
            saveUninitialized: true,
            secret: config.SESSION_SECRET
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        try {
            const issuer = await Issuer.discover('https://auth.moochee.us')
        
            const client = new issuer.Client({
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                redirect_uris: [config.REDIRECT_URI]
            })
        
            passport.use(OPENID_CONNECT,
                new Strategy({ client }, (tokenSet, done) => {
                    const claims = tokenSet.claims()
                    done(null, { id: claims.email })
                })
            )
        } catch (err) {
            console.error('Error setting up OpenID client:', err)
        }


        app.get('/login', passport.authenticate(OPENID_CONNECT))

        app.get('/login/callback', passport.authenticate(OPENID_CONNECT, { 
            successRedirect: '/', 
            failureRedirect: '/login/error' }
        ))

        app.get('/login/error', (req, res) => {
            res.status(500).send('Authentication error')
        })

        app.get('/logout', (req, res) => {
            req.logout({}, (err) => {
                if (err) {
                    console.error(err)
                    return res.status(500).send('An error occurred during logout')
                }
                res.redirect('/')
            })
        })

        return (req, res, next) => {
            if (!req.isAuthenticated()) {
                req.session.originalUrl = req.originalUrl
                return res.redirect('/login')
            }
            next()
        }
    }
}
