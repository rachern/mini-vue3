import { Fragment, Text } from './vnode';
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

// 自定义渲染器
// createElement  创建元素
// patchProp  处理prop
// insert  插入元素
export function createRenderer(options) {
    const { createElement, patchProp, insert } = options

    // 根组件没有parent，因此为 null
    function render(vnode, container) {
        patch(null, vnode, container, null)
    }

    // n1: oldVNode
    // n2: newVNode
    function patch(n1: any, n2: any, container: any, parent: any) {
        // 处理组件
        const { type, shapeFlag } = n2

        switch(type) {
            case Fragment:
                processFragment(n1, n2, container, parent)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 是不是 element
                    processElement(n1, n2, container, parent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 是不是 component
                    processComponent(n1, n2, container, parent)
                }
                break
        }
    }

    // 处理文本
    // 当 type 为 Text 时，创建 textnode 挂载到当前容器上
    function processText(n1: any, n2: any, container: any) {
        const { children } = n2
        const textNode = n2.el = document.createTextNode(children)
        container.append(textNode)
    }

    // 处理 Fragment （插槽）
    // 当 type 为 Fragment 时，只渲染 children
    function processFragment(n1: any, n2: any, container: any, parent: any) {
        mountChildren(n2.children, container, parent)
    }

    // 处理标签元素 element
    function processElement(n1: any, n2: any, container: any, parent: any) {
        if (!n1) {
            // 挂载（初始化）
            mountElement(n2, container, parent)
        } else {
            // 更新（update）
            updateElement(n1, n2, container)
        }
    }

    function updateElement(n1: any, n2: any, container: any) {
        console.log('n1', n1)
        console.log('n2', n2)
    }

    // 挂载 element
    function mountElement(vnode: any, container: any, parent: any) {
        const el = vnode.el = createElement(vnode.type)

        const { props, children } = vnode
        // children (string array)
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // vnode
            mountChildren(children, el, parent)
        }

        // props
        for (const key in props) {
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     // 注册事件
            //     // 规则： on + Event
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, props[key])
            // } else {
            //     el.setAttribute(key, props[key])
            // }
            const val = props[key]
            patchProp(el, key, val)
        }

        // insert
        // container.append(el)
        insert(el, container)
    }

    function mountChildren(children: any[], container: any, parent: any) {
        children.forEach(v => {
            patch(null, v, container, parent)
        })
    }

    function processComponent(n1: any, n2: any, container: any, parent: any) {
        mountComponent(n2, container, parent)
    }

    function mountComponent(vnode: any, container: any, parent: any) {
        const instance = createComponentInstance(vnode, parent)

        setupComponent(instance)

        setupRenderEffect(instance, vnode, container)
    }

    function setupRenderEffect(instance: any, vnode: any, container: any) {
        // 使用 effect 做响应式
        effect(() => {
            // 初始化
            if (!instance.isMounted) {
                const { proxy } = instance
                // 使得在 render 函数中调用 this 能够获取到 setup 返回的值
                // 并且能够使用 this.$el 等属性
                const subTree = instance.subTree = instance.render.call(proxy)

                // vnode -> patch
                // vnode -> element -> mountElement
                // subTree 的父组件就是当前组件实例 instance
                patch(null, subTree, container, instance)

                // 整棵 vnode 树挂载完成之后，将 根元素 挂载到 el 上，可以通过 $el 获取到 根元素
                vnode.el = subTree.el

                instance.isMounted = true
            } else {
                // 更新
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance)

                vnode.el = subTree.el
                instance.isMounted = true
            }
        })
    }

    // 因为 createApp 多套了一层函数，无法直接暴露给用户使用
    // 此处返回 createApp 用于 runtime-dom 调用
    return {
        createApp: createAppAPI(render)
    }
}
