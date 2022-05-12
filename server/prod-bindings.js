'use strict'

import CFClient from './cf-client.js'
import Auth from './auth.js'

const dedicatedOrigin = process.env.DEDICATED_ORIGIN

const services = JSON.parse(process.env.VCAP_SERVICES)
const app = JSON.parse(process.env.VCAP_APPLICATION)
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

const cfUser = process.env['CF_USER'], cfPw = process.env['CF_PW']

export default {
    auth: new Auth(authConfig),
    appStopper: new CFClient(app.cf_api, cfUser, cfPw),
    privateQuizzesDir: privateQuizzesDir,
    dedicatedOrigin: dedicatedOrigin,
    port: process.env.PORT
}
