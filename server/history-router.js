import { Router } from 'express'

export default function create(historyService) {
    const router = new Router()

    router.get('/', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).end('Not authenticated!')
        }
        try {
            const host = req.user.id
            const items = await historyService.getAllMine(host)
            res.status(200).send(items).end()
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
            const quiz = await historyService.delete(req.params.id)
            res.status(200).send(quiz).end()
        } catch (error) {
            console.error(error)
            res.status(500).end()
        }
    })

    return router
}
