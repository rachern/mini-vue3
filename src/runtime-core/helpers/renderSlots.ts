import { Fragment, createVNode } from "../vnode";

// 暴露该方法给用户使用
// 用户通过该方法将 slot 渲染成 vnode
export function renderSlots(slots, name, props) {
    const slot = slots[name]

    if (typeof slot === 'function') {
        // slot 不需要额外包裹一层元素
        // 使用 Fragment 直接渲染 slot
        return createVNode(Fragment, {}, slot(props))
    }
}