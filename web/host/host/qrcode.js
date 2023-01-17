import { html, useRef } from '../../../node_modules/htm/preact/standalone.mjs'
import { getQrCodeUrlByGameId } from '../game-urls.js'

window.loadCss('/web/host/host/qrcode.css')

export default function QrCode({ gameId }) {
    const qrCodeDialogRef = useRef({})

    const enlargeQrCode = () => qrCodeDialogRef.current.showModal()

    const closeDialog = () => qrCodeDialogRef.current.close()

    const qrCodeUrl = getQrCodeUrlByGameId(gameId)
    const qrCodeDialog = html`<dialog class=enlargedQrCode ref=${qrCodeDialogRef} onClick=${closeDialog}>
        <img class=qrCode src='${qrCodeUrl}' />
    </dialog>`
    const qrCodeThumbnail = html`<img class=qrCodeThumbnail onClick=${enlargeQrCode} src=${qrCodeUrl} />`

    return html`${qrCodeThumbnail} ${qrCodeDialog}`
}