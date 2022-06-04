'use strict'

import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'

export default function QuizService(directory) {
    this.getAll = async (author) => {
        await createDirectoryIfNotExists()

        const dirents = await readdir(directory, { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory() || dirent.name.slice(-5) !== '.json') continue
            try {
                const quiz = await this.get(dirent.name)
                if (quiz.author === author || !quiz.isPrivate) {
                    // REVISE once the quiz builder has the capability to add tags AND we migrated existing date, remove the default tags: []
                    // REVISE add test for quiz builder
                    quizzes.push({ id: dirent.name, title: quiz.title, tags: quiz.tags || [] })
                }
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        // REVISE remove after all legacy quizzes moved from git repo to file volume
        const legacyQuizzes = await this.getAllLegacy()
        quizzes.push.apply(quizzes, legacyQuizzes)

        return quizzes
    }

    // REVISE remove after all legacy quizzes moved from git repo to file volume
    this.getAllLegacy = async () => {
        const dirents = await readdir('./quiz', { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory()) continue
            try {
                const quiz = await this.get(dirent.name)
                quizzes.push({ id: dirent.name, title: quiz.title, tags: quiz.tags })
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return quizzes
    }

    this.getAllMine = async (author) => {
        await createDirectoryIfNotExists()

        const dirents = await readdir(directory, { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory() || dirent.name.slice(-5) !== '.json') continue
            try {
                const quiz = await this.get(dirent.name)
                if (quiz.author === author) {
                    quizzes.push({ id: dirent.name, title: quiz.title, tags: quiz.tags || [] })
                }
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return quizzes
    }
    
    // REVISE after all legacy quizzes moved from git repo to file volume
    this.get = async (quizId) => {
        const quizPath = `${directory}/${quizId}`
        let quiz
        try {
            quiz = JSON.parse(await readFile(quizPath, 'utf8'))
        } catch (error) {
            quiz = this.getLegacy(quizId)
        }
        return quiz
    }

    // REVISE remove after all legacy quizzes moved from git repo to file volume
    this.getLegacy = async (quizId) => {
        const quizPath = `./quiz/${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    const createDirectoryIfNotExists = async () => {
        try {
            await access(directory)
        } catch (error) {
            await mkdir(directory)
        }
    }

    this.create = async (quiz, author) => {
        const id = `${Date.now().toString(36).slice(-5)}.json`
        const quizContent = { ...quiz, author }
        await writeFile(`${directory}/${id}`, JSON.stringify(quizContent))
        return id
    }

    this.delete = async (id) => {
        const fileName = `${directory}/${id}`
        await rm(fileName)
    }

    this.update = async (id, quiz, author) => {
        const quizContent = { ...quiz, author }
        await writeFile(`${directory}/${id}`, JSON.stringify(quizContent))
        return id
    }
}
