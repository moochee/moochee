export default function until(query) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval)
            reject(new Error('Timeout while waiting until element appears'))
        }, 1000)
        const interval = setInterval(() => {
            const result = query()
            if (result) {
                clearTimeout(timeout)
                clearInterval(interval)
                resolve(result)
            }
        }, 10)
    })
}