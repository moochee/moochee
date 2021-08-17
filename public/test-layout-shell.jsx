'use strict'

import Shell from './components/shell/shell.jsx'

const shell = <Shell headerCenter='Passionate Product Ownership'>
    <div>demo content</div>
</Shell>

ReactDOM.render(shell, document.querySelector('#react-root'))