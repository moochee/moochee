'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`/app/bin/dokku ps:stop ${appName}`, { shell: '/app/bin/sh'}, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
