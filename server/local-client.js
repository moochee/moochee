import { exec } from 'child_process'

export default function create() {
    return {
        stop: () => {
            exec(`kill ${process.pid}`)
        }
    }
}
