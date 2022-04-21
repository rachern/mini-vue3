import { ShapeFlags } from "../shared/ShapeFlags"

// 初始化 slots
// 组件的 slot 通过 children 进行传递
export function initSlots(instance, children) {
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}

// 具名插槽，通过children的key
// 作用域插槽，通过函数参数传递
function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const value = children[key]

        slots[key] = (props) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value]
}