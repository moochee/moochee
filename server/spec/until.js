export default function until(query, silent = true) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearInterval(interval)
            reject(new Error('Timeout while waiting until element appears. Use non-silent mode to see nested errors.'))
        }, 1000)
        const interval = setInterval(() => {
            try {
                const result = query()
                if (result) {
                    clearTimeout(timeout)
                    clearInterval(interval)
                    resolve(result)
                }
            } catch (e) {
                if (!silent) {
                    console.error(e)
                }
            }
        }, 10)
    })
}
