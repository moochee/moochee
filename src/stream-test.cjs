const { Transform } = require('stream')
const { jsxLoader } = require('./lib/jsxLoader.min.cjs')

const createCompileStream = function() {
    let buffer = Buffer.from('')
    return new Transform({
        transform(data, encoding, callback) {
            buffer = Buffer.concat([buffer, data])
            callback()
        },
        flush(callback) {
            this.push(jsxLoader.compiler.compile(buffer.toString()))
            callback()
        }
    })
}

const stream = createCompileStream()

stream.write('<Comp>hello mama</Comp>')

stream.pipe(process.stdout)

stream.end()
