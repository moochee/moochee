'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`/host/usr/bin/dokku apps:destroy --force ${appName}`, { 
                shell: 'bash',
                env: {'DOKKU_LIB_PATH': '/host/var/lib/dokku'}
            }, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
