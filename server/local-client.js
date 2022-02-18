import { exec } from 'child_process'

export default function create() {
    return {
        stop: () => {
            return new Promise((resolve, reject) => {
                exec(`kill ${process.pid}`, (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }
}
