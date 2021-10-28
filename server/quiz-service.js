'use strict'

import { readFile, readdir, access, mkdir, writeFile } from 'fs/promises'

export default function QuizService() {
    const publicDir = './quiz/'

    this.get = async (quizId) => {
        const quizPath = `${publicDir}${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    this.getAll = async () => {
        const dirents = await readdir(publicDir, { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory()) continue
            try {
                const quizTitle = (await this.get(dirent.name)).title
                quizzes.push({ id: dirent.name, title: quizTitle })
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return quizzes
    }

    this.create = async (quiz, email, dir) => {
        const tenantDir = `${dir}/sap`
        const userDir = `${tenantDir}/${email}`
        try {
            await access(tenantDir)
        } catch (error) {
            await mkdir(tenantDir)
        }
        try {
            await access(userDir)
        } catch (error) {
            await mkdir(userDir)
        }
        const shortName = (+new Date).toString(36).slice(-5)
        await writeFile(`${userDir}/${shortName}.json`, JSON.stringify(quiz))
        return quiz
    }
}
