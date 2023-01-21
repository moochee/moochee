import { readFile, readdir, writeFile, access, mkdir, rm } from 'fs/promises'

export default function HistoryService(directory) {

    this.getAllMine = async (host) => {
        await createDirectoryIfNotExists()
        const LAST_EVENT_DATE = '2022-08-19T22:06:32.637Z'
        const files = await readdir(directory)
        let historyItems = []
        for (let file of files) {
            try {
                const historyItem = await this.get(file)
                if (historyItem.host === host) {
                    historyItems.push({ 
                        id: file, 
                        title: historyItem.title, 
                        scoreboard: historyItem.scoreboard,
                        playedAt: historyItem.playedAt ? historyItem.playedAt : LAST_EVENT_DATE
                    })
                }
            } catch (error) {
                console.warn(file, error)
            }
        }
        historyItems.sort((a, b) => { return new Date(b.playedAt) - new Date(a.playedAt)})
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
        const id = historyItem.gameId
        const historyItemContent = { ...historyItem, host, playedAt: new Date().toISOString() }
        await writeFile(`${directory}/${id}`, JSON.stringify(historyItemContent))
        return id
    }

    this.delete = async (id) => {
        const historyItemPath = `${directory}/${id}`
        await rm(historyItemPath)
    }
}