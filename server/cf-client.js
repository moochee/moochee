import https from 'https'

const Client = function (api, username, password) {
    let token = '', tokenExpiryTime = 0

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

    // REVISE need to have proper error handling e.g. when authentication fails
    const assertLoggedIn = async () => {
        if (Date.now() > tokenExpiryTime) {
            const apiInfo = await get(`${api}/v2/info`, { 'Accept': 'application/json' })
            const loginInfo = await get(`${apiInfo.authorization_endpoint}/login`, { 'Accept': 'application/json' })
            const data = `grant_type=password&password=${password}&username=${username}&scope=`
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic Y2Y6'
            }
            const loginResponse = await post(`${loginInfo.links.login}/oauth/token`, headers, data)
            token = loginResponse.access_token
            tokenExpiryTime = Date.now() + loginResponse.expires_in * 1000
        }
    }

    // TODO rather delete the app instead of stop
    this.stop = async () => {
        await assertLoggedIn()
        const appId = JSON.parse(process.env.VCAP_APPLICATION).application_id
        return post(`${api}/v3/apps/${appId}/actions/stop`, { 'Authorization': `bearer ${token}` }, '')
    }
}

export default function create() {
    const username = process.env['CF_USER']
    const password = process.env['CF_PW']
    return new Client('https://api.cf.sap.hana.ondemand.com', username, password)
}

// const user = process.env['CF_USER']
// console.log(user)
// const pw = process.env['CF_PW']
// const client = new Client('https://api.cf.sap.hana.ondemand.com', user, pw)
// const appId = '069a7e96-4fff-4377-a60c-9ab8e12fcae3'
// client.post(`/v3/apps/${appId}/actions/stop`).catch(console.error)
