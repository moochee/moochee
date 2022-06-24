'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`/host/usr/bin/dokku ps:stop ${appName}`, { shell: '/host/usr/bin/bash'}, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
