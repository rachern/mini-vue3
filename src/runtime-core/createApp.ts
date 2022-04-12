import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 组件 -> vnode
            const vnode = createVNode(rootComponent)

            // 渲染虚拟节点
            render(vnode, rootContainer)
        }
    }
}