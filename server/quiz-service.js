'use strict'

import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'

export default function QuizService(directory) {
    this.getAll = async (author) => {
        const dirents = await readdir('./quiz', { withFileTypes: true })
        let publicQuizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory()) continue
            try {
                const quiz = await this.get(dirent.name)
                publicQuizzes.push({ id: dirent.name, title: quiz.title, tags: quiz.tags })
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        const quizzes = await this.getAllPrivate(author)
        quizzes.push.apply(quizzes, publicQuizzes)
        return quizzes
    }

    this.getAllPrivate = async (author) => {
        await createDirectoryIfNotExists()

        const dirents = await readdir(directory, { withFileTypes: true })
        let quizzes = []
        for (let dirent of dirents) {
            if (dirent.isDirectory()) continue
            try {
                const quiz = await this.getPrivate(dirent.name)
                if (quiz.author === author || !quiz.isPrivate) {
                    // REVISE once the quiz builder has the capability to add tags AND we migrated existing date, remove the default tags: []
                    // REVISE add test for quiz builder
                    quizzes.push({ id: dirent.name, title: quiz.title, tags: quiz.tags || [] })
                }
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return quizzes
    }
    
    this.get = async (quizId) => {
        const quizPath = `./quiz/${quizId}`
        let quiz
        try {
            quiz = JSON.parse(await readFile(quizPath, 'utf8'))
        } catch (error) {
            quiz = this.getPrivate(quizId)
        }
        return quiz
    }

    this.getPrivate = async (quizId) => {
        const quizPath = `${directory}/${quizId}`
        return JSON.parse(await readFile(quizPath, 'utf8'))
    }

    const createDirectoryIfNotExists = async () => {
        try {
            await access(directory)
        } catch (error) {
            await mkdir(directory)
        }
    }

    this.create = async (quiz, isPrivate, author) => {
        const id = `${Date.now().toString(36).slice(-5)}.json`
        const quizContent = { ...quiz, isPrivate, author }
        await writeFile(`${directory}/${id}`, JSON.stringify(quizContent))
        return id
    }

    this.delete = async (id) => {
        const fileName = `${directory}/${id}`
        await rm(fileName)
    }

    this.update = async (id, quiz, isPrivate, author) => {
        const quizContent = { ...quiz, isPrivate, author }
        await writeFile(`${directory}/${id}`, JSON.stringify(quizContent))
        return id
    }
}
