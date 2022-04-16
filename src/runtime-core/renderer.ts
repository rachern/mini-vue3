import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    // 处理组件

    if (typeof vnode.type === 'string') {
        // 判断 是不是 element
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        // 判断 是不是 component
        processComponent(vnode, container)
    }
}

// 处理标签元素 element
function processElement(vnode: any, container: any) {
    // 挂载（初始化）
    mountElement(vnode, container)
    // TODO
    // 更新（update）
}

// 挂载 element
function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)

    const { props, children } = vnode
    // children (string array)
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        // vnode
        mountChildren(children, el)
    }

    // props
    for (const key in props) {
        el.setAttribute(key, props[key])
    }

    container.append(el)
}

function mountChildren(children: any[], container: any) {
    children.forEach(v => {
        patch(v, container)
    })
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)

    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container: any) {
    const subTree = instance.render()

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)
}

