'use strict'

import { jsxLoader } from './lib/jsxLoader.min.cjs'
import { promises as fs } from 'fs'

export default async (req, res, next) => {
    if (req.path.indexOf('.jsx') > -1) {
        try {
            const jsxContent = await fs.readFile(`public${req.path}`)
            const jsContent = jsxLoader.compiler.compile(jsxContent.toString())
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
            res.send(jsContent)
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.status(404).send(`Not found: ${req.path}`)
            } else {
                next(error)
            }
        }
    } else {
        next()
    }
}
