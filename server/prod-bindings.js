import CFClient from './cf-client.js'
import Auth from './auth.js'

const dedicatedOrigin = process.env.DEDICATED_ORIGIN

const services = JSON.parse(process.env.VCAP_SERVICES)
const serviceEnvs = Object.keys(services).map(key => services[key]).flat()

const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')
const authConfig = {
    IDP: uaa.credentials.url,
    CLIENT_ID: uaa.credentials.clientid,
    CLIENT_SECRET: uaa.credentials.clientsecret,
    REDIRECT_URI: `${dedicatedOrigin}/login/callback`,
    SESSION_SECRET: uaa.credentials.clientsecret
}

const privateQuizzesDir = serviceEnvs.find(f => f.name === 'gorilla-fs').volume_mounts[0].container_dir

const vcapApp = JSON.parse(process.env.VCAP_APPLICATION)
const cfClientConfig = {
    api: vcapApp.cf_api, appId: vcapApp.application_id, user: process.env['CF_USER'], pw: process.env['CF_PW']
}

const auth = new Auth(authConfig)
const appStopper = new CFClient(cfClientConfig)
const port = process.env.PORT
const gameExpiryTimer = {
    onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)
}

export { auth, appStopper, privateQuizzesDir, dedicatedOrigin, port, gameExpiryTimer }