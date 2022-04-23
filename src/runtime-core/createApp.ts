import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            if (typeof rootContainer === 'string') {
                rootContainer = document.querySelector(rootContainer)
            }
            // 组件 -> vnode
            const vnode = createVNode(rootComponent)

            // 渲染虚拟节点
            // 根组件没有parent，因此为 null
            render(vnode, rootContainer, null)
        }
    }
}