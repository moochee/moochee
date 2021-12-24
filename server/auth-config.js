'use strict'

export default function getAuthConfig() {
    const services = JSON.parse(process.env.VCAP_SERVICES)
    const serviceEnvs = Object.keys(services).map(key => services[key]).flat()
    const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')
    const host = process.env.DEDICATED_ORIGIN

    return {
        IDP: uaa.credentials.url,
        CLIENT_ID: uaa.credentials.clientid,
        CLIENT_SECRET: uaa.credentials.clientsecret,
        REDIRECT_URI: `${host}/login/callback`,
        // REVISE this looks hacky...
        SESSION_SECRET: process.env.SESSION_SECRET || uaa.credentials.clientsecret
    }
}
