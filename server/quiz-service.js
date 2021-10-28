'use strict'

import { readFile, readdir, access, mkdir, writeFile } from 'fs/promises'

export default function QuizService() {
    const publicDir = './quiz'

    this.get = async (quizId) => {
        const quizPath = `${publicDir}/${quizId}`
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

    this.create = async (quiz, email, rootDir) => {
        const { userDir, tenantDir } = getDirs(email, rootDir)
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

    this.getByEmail = async (quizId, email, rootDir) => {
        const { userDir } = getDirs(email, rootDir)
        const quizPath = `${userDir}/${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    this.getAllByEmail = async (email, rootDir) => {
        const { userDir } = getDirs(email, rootDir)
        const dirents = await readdir(userDir, { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory()) continue
            try {
                const quizTitle = (await this.getByEmail(dirent.name, email, rootDir)).title
                quizzes.push({ id: dirent.name, title: quizTitle })
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return quizzes
    }

    const getDirs = (email, rootDir) => {
        const tenantDir = `${rootDir}/sap`
        const userDir = `${tenantDir}/${email}`
        return { userDir, tenantDir }
    }
}
