import HistoryService from '../history-service.js'
import dummyHistoryItem from './dummy/history-item.js'

const dummyDirectory = 'history'
const dummyHost = 'test@example.com'

describe('History service', () => {
    let historyService, itemId

    beforeAll(async () => {
        historyService = new HistoryService(dummyDirectory)
        itemId = await historyService.create(dummyHistoryItem, dummyHost)
    })

    afterAll(async () => {
        await historyService.delete(itemId)
    })
    
    it('returns at least one item when getting all my finished games', async () => {
        const all = await historyService.getAllMine(dummyHost)
        expect(all.length).toBeGreaterThan(0)
    })

    it('returns the content when getting the history item by id', async () => {
        const actualHistoryItem = await historyService.get(itemId)
        const expectedHistoryItem = { ...dummyHistoryItem, host: dummyHost}
        expect(actualHistoryItem).toEqual(expectedHistoryItem)
    })
})