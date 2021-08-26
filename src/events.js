'use strict'

import https from 'https'

const options = {
    hostname: 'acdc-leaderboard.cfapps.sap.hana.ondemand.com',
    port: 443,
    path: '/api/v1/leaderboards',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}



export default function Events(io) {
    this.publish = (eventName, gameId, ...args) => {

        if (eventName === 'gameFinished') {
            const data = new TextEncoder().encode(
                JSON.stringify({ quizTitle: 'test', scores: [{ name: 'Bob', score: 100 }] })
            )

            const req = https.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                res.on('data', d => {
                    process.stdout.write(d)
                })
            })

            req.on('error', error => {
                console.error(error)
            })

            req.write(data)
            req.end()
        }

        // REVISE if we already go to the gameId 'channel' using io.to(channel), then do we really need to pass the gameId again in the event args?
        io.to(gameId).emit(eventName, gameId, ...args)
    }
}
