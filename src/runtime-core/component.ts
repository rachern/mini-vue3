import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => {}
    }

    // 将 emit 函数挂载到组件实例上，bind 使得在 emit 中能够拿到当前实例
    component.emit = emit.bind(null, component) as any

    return component
}

export function setupComponent(instance) {
    // TODO
    // 处理 props
    initProps(instance, instance.vnode.props)
    // 处理 slots
    initSlots(instance, instance.vnode.children)

    setupStatefulComponent(instance)

}

function setupStatefulComponent(instance: any) {
    const Component = instance.type

    // 在实例上挂载一个 proxy 代理对象，使得可以通过 this.xxx 获取到相应的值
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component

    if (setup) {
        // 调用 setup 的时候将 props 传进去
        // 并且 props 是 shallowReadonly 属性
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })

        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance: any, setupResult: any) {
    // function Object
    // TODO function
    // 执行完 setup 函数之后，将返回值添加到了实例对象的 setupState 上
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type

    if (Component.render) {
        instance.render = Component.render
    }
}

