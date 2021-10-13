'use strict'

const vcapServices = JSON.parse(process.env.VCAP_SERVICES || {})
const serviceEnvs = Object.keys(vcapServices).map(key => vcapServices[key]).flat()
const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')

export default {
    IDP: uaa.credentials.url,
    CLIENT_ID: uaa.credentials.clientid,
    CLIENT_SECRET: uaa.credentials.clientsecret,
    REDIRECT_URI: process.env.REDIRECT_URI || 'https://acdc-gorilla.cfapps.sap.hana.ondemand.com/login/callback',
    SESSION_SECRET: process.env.SESSION_SECRET || uaa.credentials.clientsecret
}