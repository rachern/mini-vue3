import { proxyRefs } from "../reactivity"
import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        next: null, // 新的虚拟节点
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
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
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)

        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance: any, setupResult: any) {
    // function Object
    // TODO function
    // 执行完 setup 函数之后，将返回值添加到了实例对象的 setupState 上
    if (typeof setupResult === 'object') {
        // 使用 proxyRefs 对 setup 返回的对象做自动解构，使得在 template 中不需要通过 .value 取值
        instance.setupState = proxyRefs(setupResult)
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type

    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template)
        }
    }

    if (Component.render) {
        instance.render = Component.render
    }
}

let currentInstance = null

// 返回当前实例对象
export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance
}

let compiler

export function registerRuntimeCompiler(_compiler) {
    compiler = _compiler
}