import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export { createVNode as createElementVNode }

export function createVNode(type, props?, children?) {

    const vnode = {
        type,
        props,
        children,
        component: null, // 组件实例
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    // 类型修改，在判断 vnode 类型的基础上判断 children 的类型
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    // slot_children 组件 + children（object）
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode
}

// 提供创建文本节点的方法
export function createTextVNode(text: string) {
    return createVNode(Text, {}, text)
}

function getShapeFlag(type: any) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

