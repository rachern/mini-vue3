import { h, ref } from "../../lib/guide-mini-vue3.esm.js"

const prevChildren = 'oldChildren'
const newChildren = [h('div', {}, 'newChild1'), h('div', {}, 'newChild2')]

export default {
    name: 'Text2Array',

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
            : h('div', {}, prevChildren)
    }
}