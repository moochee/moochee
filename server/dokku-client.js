'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.DEDICATED_ORIGIN.substring(8, 15)
        exec(`dokku ps:stop ${appName}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`)
                return
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`)
                return
            }
            console.log(`stdout: ${stdout}`)
        })
    }
}
