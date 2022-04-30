'use strict'

import { Router } from 'express'
import QuizService from './quiz-service.js'

export default function create(directory) {
    const router = new Router()
    const quizService = new QuizService(directory)

    router.post('/', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            const authorEmail = req.user.claims.email
            const quiz = await quizService.create(req.body, true, authorEmail)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.get('/', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            const authorEmail = req.user.claims.email
            let quizList
            if (req.query.private) {
                quizList = await quizService.getAllPrivate(authorEmail)
            } else {
                quizList = await quizService.getAll(authorEmail)
            }
            res.status(200).send(quizList).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.delete('/:id', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            await quizService.delete(req.params.id)
            res.status(200).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.get('/:id', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            const quiz = await quizService.getPrivate(req.params.id)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    router.put('/:id', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            await quizService.update(req.params.id, req.body)
            res.status(200).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    return router
}
