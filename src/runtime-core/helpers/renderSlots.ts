import { createVNode } from "../vnode";

// 暴露该方法给用户使用
// 用户通过该方法将 slot 渲染成 vnode
export function renderSlots(slots, name, props) {
    const slot = slots[name]

    if (typeof slot === 'function') {
        return createVNode('div', {}, slot(props))
    }
}