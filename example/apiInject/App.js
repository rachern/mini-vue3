import { h, provide, inject } from '../../lib/guide-mini-vue3.esm.js'

const Provider = {
    name: 'Provider',
    setup() {
        provide('foo', 'fooVal')
        provide('bar', 'barVal')
    },
    render() {
        return h('div', {}, [h('p', {}, 'Provider'), h(ProvideTwo)])
    }
}

const ProvideTwo = {
    name: 'ProviderTwo',
    setup() {
        provide('foo', 'fooValTwo')
        const foo = inject('foo')
        return { foo }
    },
    render() {
        return h('div', {}, [h('p', {}, `ProviderTwo - ${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: 'Consumer',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        // const baz = inject('baz', 'bazVal')
        const baz = inject('baz', () => 'bazVal')

        return { foo, bar, baz }
    },
    render() {
        return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz}`)
    }
}

export default {
    name: 'App',
    setup() {
        return {}
    },
    render() {
        return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
    }
}