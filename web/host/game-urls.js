const getJoinUrl = (gameId) => `${window.location.origin}/web/play/#/game/${gameId}`

const getQrCodeUrlByJoinUrl = (joinUrl) => `${window.location.origin}/qr-code?url=${encodeURIComponent(joinUrl)}`

const getQrCodeUrlByGameId = (gameId) => {
    const joinUrl = getJoinUrl(gameId)
    return getQrCodeUrlByJoinUrl(joinUrl)
}

export { getJoinUrl, getQrCodeUrlByJoinUrl, getQrCodeUrlByGameId }