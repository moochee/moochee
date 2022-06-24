'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`/host/usr/bin/bash /host/usr/bin/dokku ps:stop ${appName}`, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
