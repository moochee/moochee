import { Router } from 'express'
import QuizService from './quiz-service.js'

export default function create(directory) {
    const router = new Router()
    const quizService = new QuizService(directory)

    router.post('/', async (req, res) => {
        try {
            const author = req.user.id
            const id = await quizService.create(req.body, author)
            const quiz = await quizService.get(id)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.get('/', async (req, res) => {
        try {
            const author = req.user.id
            let quizList
            if (req.query.mine) {
                quizList = await quizService.getAllMine(author)
            } else {
                quizList = await quizService.getAll(author)
            }
            res.status(200).send(quizList).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.delete('/:id', async (req, res) => {
        try {
            await quizService.delete(req.params.id)
            res.status(200).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.get('/:id', async (req, res) => {
        try {
            const quiz = await quizService.get(req.params.id)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.put('/:id', async (req, res) => {
        try {
            const author = req.user.id
            await quizService.update(req.params.id, req.body, author)
            res.status(200).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    return router
}
