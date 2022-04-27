import { h, ref } from "../../lib/guide-mini-vue3.esm.js"

const oldChildren = 'oldChildren'
const newChildren = 'newChildren'

export default {
    name: 'Text2Text',

    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        
        return {
            isChange
        }
    },

    render() {
        return this.isChange
            ? h('div', {}, newChildren)
            : h('div', {}, oldChildren)
    }
}