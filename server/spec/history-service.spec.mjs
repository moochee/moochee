import HistoryService from '../history-service.js'
import dummyHistoryItem from './dummy/history-item.js'

const dummyDirectory = 'history'
const dummyHost = 'test@example.com'

describe('History service', () => {
    let historyService, historyItemId

    beforeAll(async () => {
        historyService = new HistoryService(dummyDirectory)
        historyItemId = await historyService.create(dummyHistoryItem, dummyHost)
    })

    afterAll(async () => {
        await historyService.delete(historyItemId)
    })
    
    it('returns at least one quiz when getting all my finished games', async () => {
        const all = await historyService.getAllMine(dummyHost)
        expect(all.length).toBeGreaterThan(0)
    })
})