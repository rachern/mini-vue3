import { h } from "../../lib/guide-mini-vue3.esm.js"

export const App = {
    name: 'App',
    setup() {
        return {
            x: 300,
            y: 300
        }
    },

    render() {
        return h('rect', { x: this.x, y: this.y })
    }
}