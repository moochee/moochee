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

    it('should create an instance with own pools', () => {
        avatars = new Avatars([[]])
        expect(avatars.size()).toEqual(0)
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
        avatars = new Avatars([['x'], ['y']])
        expect(avatars.pick()).toEqual('x')
    })

    it('should pick from next pool if higher pool is empty', () => {
        avatars = new Avatars([[], ['y']])
        expect(avatars.pick()).toEqual('y')
    })

    it('should reduce the size after picking', () => {
        const size = avatars.size()
        avatars.pick()
        const sizeAfterPick = avatars.size()
        expect(size).toEqual(sizeAfterPick + 1)
    })

    it('should throw error if no avatar to pick', () => {
        avatars = new Avatars([[]])
        expect(() => avatars.pick()).toThrow()
    })

    it('should have no duplicates', () => {
        const size = avatars.size()
        const sizeNoDuplication = avatars.size(true)
        expect(size).toEqual(sizeNoDuplication)
    })
})