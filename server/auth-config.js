'use strict'

const vcapServices = JSON.parse(process.env.VCAP_SERVICES || {})
const serviceEnvs = Object.keys(vcapServices).map(key => vcapServices[key]).flat()
const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')
const vcapApplication = JSON.parse(process.env.VCAP_APPLICATION || {})
const uri = vcapApplication.uris[0]
const protocol = uri.indexOf('localhost') >= 0 ? 'http' : 'https'

export default {
    IDP: uaa.credentials.url,
    CLIENT_ID: uaa.credentials.clientid,
    CLIENT_SECRET: uaa.credentials.clientsecret,
    REDIRECT_URI: `${protocol}://${uri}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET || uaa.credentials.clientsecret
}