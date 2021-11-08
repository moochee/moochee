'use strict'

export default function getAuthConfig(vcapServices = process.env.VCAP_SERVICES, vcapApplication = process.env.VCAP_APPLICATION) {
    const services = JSON.parse(vcapServices || {})
    const serviceEnvs = Object.keys(services).map(key => services[key]).flat()
    const uaa = serviceEnvs.find(entry => entry.name === 'gorilla-uaa')

    const application = JSON.parse(vcapApplication || {})
    // fallback uri is provided because url in VCAP_APPLICATION is empty when deploying new version hidden
    const uri = application.uris[0] || 'acdc-gorilla.cfapps.sap.hana.ondemand.com'
    const protocol = uri.indexOf('localhost') >= 0 ? 'http' : 'https'

    return {
        IDP: uaa.credentials.url,
        CLIENT_ID: uaa.credentials.clientid,
        CLIENT_SECRET: uaa.credentials.clientsecret,
        REDIRECT_URI: `${protocol}://${uri}/login/callback`,
        SESSION_SECRET: process.env.SESSION_SECRET || uaa.credentials.clientsecret
    }
}
