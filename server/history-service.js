'use strict'

import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'

export default function HistoryService(directory) {

    this.getAllMine = async (host) => {
        await createDirectoryIfNotExists()

        const dirents = await readdir(directory, { withFileTypes: true })
        let historyItems = []
        for (let dirent of dirents) {
            if (dirent.isDirectory() || dirent.name.slice(-5) !== '.json') continue
            try {
                const historyItem = await this.get(dirent.name)
                if (historyItem.host === host) {
                    historyItems.push({ 
                        id: dirent.name, 
                        title: historyItem.title, 
                        scoreboard: historyItem.scoreboard
                    })
                }
            } catch (error) {
                console.error(dirent.name, error)
            }
        }
        return historyItems
    }

    this.get = async (id) => {
        const historyItemPath = `${directory}/${id}`
        let historyItem
        try {
            historyItem = JSON.parse(await readFile(historyItemPath, 'utf8'))
        } catch (error) {
            console.error(historyItemPath, error)
        }
        return historyItem
    }

    const createDirectoryIfNotExists = async () => {
        try {
            await access(directory)
        } catch (error) {
            await mkdir(directory)
        }
    }

    this.create = async (historyItem, host) => {
        await createDirectoryIfNotExists()

        const id = `${historyItem.gameId}.json`
        const historyItemContent = { ...historyItem, host }
        await writeFile(`${directory}/${id}`, JSON.stringify(historyItemContent))
        return id
    }

    this.delete = async (id) => {
        const historyItemPath = `${directory}/${id}`
        await rm(historyItemPath)
    }
}