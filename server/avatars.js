export default function Avatars(pools) {
    const priorityPools = pools || [
        Array.from('🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐲🐙🦋🐞🦀'),
        Array.from('🐔🐧🦆🦅🦉🦇🐺🐴🦄🐝🐛🐌🐜🐢🐍🦎🐠🐬🐳🐊'),
        Array.from('🐦🐤🦂🐗🐽🙉🙊🐒🐣🐥🦑🦐🐡🐟🐋🦈🐅🐆🦍🐘🦏🐪🐫🐃🐎🐖🐏🐑🐐🦌🐕🐩🐈🦃🐇🐁🐀🐉👹👺🤡👻👽👾🤖🎃😺👮👷🤶🎅🌞🌝')
    ]

    this.size = (noDuplication) => {
        let size = 0
        if (noDuplication) {
            size = new Set(priorityPools.flat()).size
        } else {
            priorityPools.forEach((pool) => size += pool.length)
        }
        return size
    }

    this.pick = () => {
        let avatar = null
        for (let pool of priorityPools) {
            avatar = pool.splice(Math.random() * pool.length, 1)[0]
            if (avatar) break
        }
        if (!avatar) throw new Error('Avatars are used up')
        return avatar
    }
}
