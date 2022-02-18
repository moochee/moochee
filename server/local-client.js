import { exec } from 'child_process'

export default function create() {
    return {
        stop: () => {
            // REVISE check if this causes trouble since it is not returning a promise
            exec(`kill ${process.pid}`)
        }
    }
}
