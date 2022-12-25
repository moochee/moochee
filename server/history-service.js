import { readFile, readdir, writeFile, access, mkdir, rm, stat } from 'fs/promises'

export default function HistoryService(directory) {

    this.getAllMine = async (host) => {
        await createDirectoryIfNotExists()
        const files = await readdir(directory)
        let historyItems = []
        for (let file of files) {
            if (file.slice(-5) !== '.json') continue
            try {
                const historyItem = await this.get(file)
                if (historyItem.host === host) {
                    historyItems.push({ 
                        id: file, 
                        title: historyItem.title, 
                        scoreboard: historyItem.scoreboard,
                        playedAt: historyItem.playedAt
                    })
                }
            } catch (error) {
                console.error(file, error)
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
            const fileStat = await stat(historyItemPath)
            historyItem.playedAt = fileStat.birthtime?.toISOString()
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