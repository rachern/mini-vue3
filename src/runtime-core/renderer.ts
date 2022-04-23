import { Fragment, Text } from './vnode';
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';

// 自定义渲染器
// createElement  创建元素
// patchProp  处理prop
// insert  插入元素
export function createRenderer(options) {
    const { createElement, patchProp, insert } = options

    function render(vnode, container, parent) {
        patch(vnode, container, parent)
    }

    function patch(vnode: any, container: any, parent: any) {
        // 处理组件
        const { type, shapeFlag } = vnode

        switch(type) {
            case Fragment:
                processFragment(vnode, container, parent)
                break
            case Text:
                processText(vnode, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 是不是 element
                    processElement(vnode, container, parent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 是不是 component
                    processComponent(vnode, container, parent)
                }
                break
        }
    }

    // 处理文本
    // 当 type 为 Text 时，创建 textnode 挂载到当前容器上
    function processText(vnode: any, container: any) {
        const { children } = vnode
        const textNode = vnode.el = document.createTextNode(children)
        container.append(textNode)
    }

    // 处理 Fragment （插槽）
    // 当 type 为 Fragment 时，只渲染 children
    function processFragment(vnode: any, container: any, parent: any) {
        mountChildren(vnode.children, container, parent)
    }

    // 处理标签元素 element
    function processElement(vnode: any, container: any, parent: any) {
        // 挂载（初始化）
        mountElement(vnode, container, parent)
        // TODO
        // 更新（update）
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
            patch(v, container, parent)
        })
    }

    function processComponent(vnode: any, container: any, parent: any) {
        mountComponent(vnode, container, parent)
    }

    function mountComponent(vnode: any, container: any, parent: any) {
        const instance = createComponentInstance(vnode, parent)

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
        // subTree 的父组件就是当前组件实例 instance
        patch(subTree, container, instance)

        // 整棵 vnode 树挂载完成之后，将 根元素 挂载到 el 上，可以通过 $el 获取到 根元素
        vnode.el = subTree.el
    }

    // 因为 createApp 多套了一层函数，无法直接暴露给用户使用
    // 此处返回 createApp 用于 runtime-dom 调用
    return {
        createApp: createAppAPI(render)
    }
}
