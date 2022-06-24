'use strict'

export default function DokkuClient() {
    this.stop = () => {
        const appName = process.env.APP_NAME
        console.log(`App ${appName} to be deleted`)
    }
}
