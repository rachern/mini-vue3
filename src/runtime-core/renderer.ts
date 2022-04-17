import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    // 处理组件

    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        // 判断 是不是 element
        processElement(vnode, container)
    } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
    const el = vnode.el = document.createElement(vnode.type)

    const { props, children } = vnode
    // children (string array)
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, vnode: any, container: any) {
    const { proxy } = instance
    // 使得在 render 函数中调用 this 能够获取到 setup 返回的值
    // 并且能够使用 this.$el 等属性
    const subTree = instance.render.call(proxy)

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)

    // 整棵 vnode 树挂载完成之后，将 根元素 挂载到 el 上，可以通过 $el 获取到 根元素
    vnode.el = subTree.el
}

