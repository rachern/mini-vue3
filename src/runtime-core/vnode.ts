import { ShapeFlags } from "../shared/ShapeFlags"

export function createVNode(type, props?, children?) {

    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    // 类型修改，在判断 vnode 类型的基础上判断 children 的类型
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return vnode
}

function getShapeFlag(type: any) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

