import { createVNode } from "./vnode"

// 多套一层将 render 传进来
export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                if (typeof rootContainer === 'string') {
                    rootContainer = document.querySelector(rootContainer)
                }
                // 组件 -> vnode
                const vnode = createVNode(rootComponent)

                // 渲染虚拟节点
                render(vnode, rootContainer)
            }
        }
    }
}