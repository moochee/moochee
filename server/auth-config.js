'use strict'

const vcapServices = JSON.parse(process.env.VCAP_SERVICES || {})
const serviceEnvs = Object.keys(vcapServices).map(key => vcapServices[key]).flat()
const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')
const vcapApplication = JSON.parse(process.env.VCAP_APPLICATION || {})
// fallback uri is provided because url in VCAP_APPLICATION is empty when deploying new version hidden
const uri = vcapApplication.uris[0] || 'acdc-gorilla.cfapps.sap.hana.ondemand.com'
const protocol = uri.indexOf('localhost') >= 0 ? 'http' : 'https'

export default {
    IDP: uaa.credentials.url,
    CLIENT_ID: uaa.credentials.clientid,
    CLIENT_SECRET: uaa.credentials.clientsecret,
    REDIRECT_URI: `${protocol}://${uri}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET || uaa.credentials.clientsecret
}