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

export default function update(eventName, status) {
    if (eventName === 'gameFinished') {
        const scores = status.scoreboard.map(({ name, score }) => ({ name, score }))
        const data = new TextEncoder().encode(
            JSON.stringify({ scores: scores })
        )

        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)
        })

        req.on('error', error => {
            console.error(error)
        })

        req.write(data)
        req.end()
    }
}