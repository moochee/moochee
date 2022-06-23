'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.DEDICATED_ORIGIN.substring(8, 15)
        return new Promise((resolve, reject) => {
            exec(`dokku ps:stop ${appName}`, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
