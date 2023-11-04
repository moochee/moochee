import { Authorizer } from '@authorizerdev/authorizer-js'

export default function AuthorizerAuth(config) {
    this.setup = () => {
        const authRef = new Authorizer({
            authorizerURL: config.AUTHORIZER_URL,
            redirectURL: config.AUTHORIZER_REDIRECT_URL,
            clientID: config.AUTHORIZER_CLIENT_ID,
        })

        const authMiddleware = async (req, res, next) => {
            const token = req.query.id_token
            // Validate jwt token via authorizer sdk
            try {
                const res = await authRef.validateJWTToken({
                    token,
                    token_type: "id_token", // This can be access_token, refresh_token
                    // roles: [user] // specify roles that you want to validate jwt for, by default it will just verify jwt.
                })
                req.user = res.claims
            } catch (err) {
                console.error(err)
                return res.status(403).json({ error: "Invalid JWT token" })
            }

            next()
        }

        return authMiddleware
    }
}
