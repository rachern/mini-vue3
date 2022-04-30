import { h } from "../../lib/guide-mini-vue3.esm.js"

import Array2Text from './Array2Text.js'
import Text2Text from './Text2Text.js'
import Text2Array from './Text2Array.js'
import Array2Array from './Array2Array.js'

export const App = {
    name: 'App',
    setup() {},

    render() {
        return h('div', { tId: 1 }, [
            h('p', {}, `主页`),
            // 老的是 array 新的是 text
            // h(Array2Text),
            // 老的是 text 新的是 text
            // h(Text2Text),
            // 老的是 text 新的是 array
            // h(Text2Array),
            // 老的是 array 新的是 array
            h(Array2Array)
        ])
    }
}