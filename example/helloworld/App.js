import { h } from '../../lib/guide-mini-vue3.esm.js'

export const App = {
    render() {
        return h(
            'div', 
            { 
                id: 'test-div',
                class: 'red'
            }, 
            // string
            // 'hello, ' + this.msg
            // array
            [
                h('p', { class: 'red' }, 'red-text'),
                h('p', { class: 'blue' }, 'blue-text')
            ]
        )
    },

    setup() {
        return {
            msg: 'mini-vue3'
        }
    }
}