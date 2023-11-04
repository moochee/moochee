import { Authorizer } from '@authorizerdev/authorizer-js'

export default function AuthorizerAuth(config) {
    this.setup = () => {
        const authRef = new Authorizer({
            authorizerURL: config.AUTHORIZER_URL,
            redirectURL: config.AUTHORIZER_REDIRECT_URL,
            clientID: config.AUTHORIZER_CLIENT_ID,
        })

        const authMiddleware = async (req, res, next) => {
            const authHeader = req.headers.authorization
            if (!authHeader) {
                return res.status(403).json({ error: "Authorization not found" })
            }

            const splitHeader = authHeader.split(" ")
            if (splitHeader.length != 2) {
                return res.status(403).json({ error: "Invalid auth header" })
            }

            if (splitHeader[0].toLowerCase() != "bearer") {
                return res.status(403).json({ error: "Bearer token not found" })
            }

            const token = splitHeader[1]
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
