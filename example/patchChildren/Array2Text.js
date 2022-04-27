import { h, ref } from "../../lib/guide-mini-vue3.esm.js"
const nextChildren = 'newChildren'
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]

export default {
    name: 'Array2Text',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },

    render() {
        return this.isChange
            ? h('div', {}, nextChildren)
            : h('div', {}, prevChildren)     
    }
}