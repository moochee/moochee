'use strict'

import https from 'https'

const options = {
    hostname: 'acdc-leaderboard.internal.cfapps.sap.hana.ondemand.com',
    port: 443,
    path: '/api/v1/leaderboards',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

const sendWithHttps = (leaderboard) => {
    const data = new TextEncoder().encode(JSON.stringify(leaderboard))
    const req = https.request(options, res => console.log(`statusCode: ${res.statusCode}`))
    req.on('error', error => console.error(error))
    req.write(data)
    req.end()
}

export default function update(message, send = sendWithHttps) {
    if (message.event !== 'gameFinished') return
    const [status] = message.args
    const scores = status?.scoreboard?.map(({ name, score }) => ({ name, score }))
    scores ? send({ scores }) : null
}