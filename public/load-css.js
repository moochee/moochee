export default function (url) {
    const head = document.getElementsByTagName('head')[0]
    const cssnode = document.createElement('link')
    cssnode.type = 'text/css'
    cssnode.rel = 'stylesheet'
    cssnode.href = url
    head.appendChild(cssnode)
}
