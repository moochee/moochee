import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'
import crypto from 'crypto'

export default function QuizService(directory) {
    this.dir = directory

    this.getAll = async (author) => {
        await createDirectoryIfNotExists()
        const files = await readdir(directory)
        let quizzes = []
        for (let file of files) {
            try {
                const quiz = await this.get(file)
                if (quiz.author === author || !quiz.isPrivate) {
                    // REVISE once the quiz builder has the capability to add tags AND we migrated existing date, remove the default tags: []
                    // REVISE add test for quiz builder
                    quizzes.push({ id: file, title: quiz.title, tags: quiz.tags || [] })
                }
            } catch (error) {
                console.warn(file, error)
            }
        }
        return quizzes
    }

    this.getAllMine = async (author) => {
        await createDirectoryIfNotExists()
        const files = await readdir(directory)
        let quizzes = []
        for (let file of files) {
            try {
                const quiz = await this.get(file)
                if (quiz.author === author) {
                    quizzes.push({ id: file, title: quiz.title, tags: quiz.tags || [] })
                }
            } catch (error) {
                console.warn(file, error)
            }
        }
        return quizzes
    }
    
    this.get = async (quizId) => {
        const quizPath = `${directory}/${quizId}`
        let quiz
        try {
            quiz = JSON.parse(await readFile(quizPath, 'utf8'))
        } catch (error) {
            console.error(quizPath, error)
        }
        return quiz
    }

    const createDirectoryIfNotExists = async () => {
        try {
            await access(directory)
        } catch (error) {
            await mkdir(directory)
        }
    }

    this.create = async (quiz, author) => {
        await createDirectoryIfNotExists()

        const id = crypto.randomUUID()
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
