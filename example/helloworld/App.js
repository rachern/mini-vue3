import { h } from '../../lib/guide-mini-vue3.esm.js'

window.self = null
export const App = {
    render() {
        window.self = this
        return h(
            'div', 
            { 
                id: 'test-div',
                class: 'red',
                onClick() {
                    console.log('click')
                },
                onMouseenter() {
                    console.log('enter')
                }
            }, 
            // string
            'hello, ' + this.msg
            // array
            // [
            //     h('p', { class: 'red' }, 'red-text'),
            //     h('p', { class: 'blue' }, 'blue-text')
            // ]
        )
    },

    setup() {
        return {
            msg: 'mini-vue3'
        }
    }
}