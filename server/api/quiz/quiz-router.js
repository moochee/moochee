'use strict'

import { Router } from 'express'
import QuizService from '../../quiz-service.js'

export default function QuizRouter(directory) {
    const router = new Router()
    const quizService = new QuizService()

    router.post('/', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            const quiz = await quizService.create(req.body, req.user.claims.email, directory)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.log(error)
            res.status(500).end()
        }
    })

    return router
}
