'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`dokku ps:stop ${appName}`, { cwd: '/app/bin', shell: '/app/bin/sh'}, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
