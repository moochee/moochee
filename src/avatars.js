'use strict'

export default function Avatars() {

    this.priorityPools = []
    this.priorityPools.push(Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐤🐙🐲🦉🦋🐴🦄🐿🐝🐌🐢🦀🐠🐬🐳🐍🦎🦖🦭🐊🦧🦣🦏🐫🦒🦔🦡🦩🦢🦥🦜🦘🐘'))
    this.priorityPools.push(Array.from('🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶🫑🌽🥕🫒🧄🧅🥔🍠🥐🥯🍞🥖🥨🧇🥓🍗🌭🍔🍟🍕🥪🎂🍭🍿🍩🥮'))

    this.size = () => {
        let size = 0
        this.priorityPools.forEach((pool) => {
            size += pool.length
        })
        return size
    }
    this.pick = () => {
        let avatar = null
        for (const pool of this.priorityPools) {
            avatar = pool.splice(Math.random() * pool.length, 1)[0]
            if (avatar) break
        }
        if (!avatar) throw new Error('Avatars are used up')
        return avatar
    }
}