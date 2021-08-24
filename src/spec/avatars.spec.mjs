'use strict'

import Avatars from '../avatars.js'

describe('Avatars', () => {
    let avatars

    beforeEach(() => {
        avatars = new Avatars()
    })

    it('should create an instance', () => {
        expect(avatars).toBeDefined()
    })

    it('should get the size', () => {
        expect(avatars.size()).toEqual(jasmine.any(Number))
    })

    it('should pick one avatar at a time', () => {
        expect(avatars.pick()).toEqual(jasmine.any(String))
    })

    it('should pick randomly', () => {
        const a1 = avatars.pick()
        const a2 = avatars.pick()
        expect(a1).not.toEqual(a2)
    })

    it('should pick from higher pool first', () => {
        avatars.priorityPools = [[1], [2]]
        expect(avatars.pick()).toEqual(1)
    })

    it('should pick from next pool if higher pool is empty', () => {
        avatars.priorityPools = [[], [2]]
        expect(avatars.pick()).toEqual(2)
    })

    it('should reduce the size after picking', () => {
        const size = avatars.size()
        avatars.pick()
        const sizeAfterPick = avatars.size()
        expect(size).toEqual(sizeAfterPick + 1)
    })

    it('should throw error if no avatar to pick', () => {
        avatars.priorityPools = [[]]
        expect(() => avatars.pick()).toThrow()
    })

    it('should have no duplicates', () => {
        const size = avatars.size()
        const sizeNoDuplication = new Set(avatars.priorityPools.flat()).size
        expect(size).toEqual(sizeNoDuplication)
    })
})