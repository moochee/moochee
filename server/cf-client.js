import https from 'https'

// REVISE consider adding a test for this, cannot easily be tested via deploy process due to async nature
export default function CFClient(config) {
    let jwt = '', jwtExpiryTime = 0

    const get = (url, headers) => {
        return send(url, { method: 'GET', headers })
    }

    const post = (url, headers, data) => {
        return send(url, { method: 'POST', headers }, data)
    }

    const send = (url, options, data) => {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, res => {
                const chunks = []
                res.on('data', d => chunks.push(d))
                res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())))
            })
            req.on('error', error => reject(error))
            if (data) {
                req.write(data)
            }
            req.end()
        })
    }

    const assertLoggedIn = async () => {
        if (Date.now() > jwtExpiryTime) {
            const apiInfo = await get(`${config.cf_api}/v2/info`, { 'Accept': 'application/json' })
            const loginInfo = await get(`${apiInfo.authorization_endpoint}/login`, { 'Accept': 'application/json' })
            const pw = encodeURIComponent(config.pw)
            const user = encodeURIComponent(config.user)
            const data = `grant_type=password&password=${pw}&username=${user}&scope=`
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic Y2Y6'
            }
            const loginResponse = await post(`${loginInfo.links.login}/oauth/token`, headers, data)
            if (!loginResponse.access_token) {
                throw new Error(JSON.stringify(loginResponse))
            }
            jwt = loginResponse.access_token
            jwtExpiryTime = Date.now() + loginResponse.expires_in * 1000
        }
    }

    this.stop = async () => {
        try {
            await assertLoggedIn()
            return post(`${config.api}/v3/apps/${config.appId}/actions/stop`, { 'Authorization': `bearer ${jwt}` }, '')
        } catch (error) {
            console.error(error)
        }
    }
}
