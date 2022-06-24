'use strict'

import { exec } from 'child_process'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        return new Promise((resolve, reject) => {
            exec(`docker run --privileged --pid=host -it node:14-alpine nsenter -t 1 -m -u -n -i bash dokku ps:stop ${appName}`, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}
