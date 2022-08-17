import { statSync } from 'fs'
import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'

export default function HistoryService(directory) {

    this.getAllMine = async (host) => {
        await createDirectoryIfNotExists()

        const files = await getSortedFiles(directory)
        let historyItems = []
        for (let file of files) {
            if (file.slice(-5) !== '.json') continue
            try {
                const historyItem = await this.get(file)
                if (historyItem.host === host) {
                    historyItems.push({ 
                        id: file, 
                        title: historyItem.title, 
                        scoreboard: historyItem.scoreboard
                    })
                }
            } catch (error) {
                console.error(file, error)
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

    const getSortedFiles = async (directory) => {
        const files = await readdir(directory)
        return files
            .map(fileName => ({
                name: fileName,
                time: statSync(`${directory}/${fileName}`).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time)
            .map(file => file.name)
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