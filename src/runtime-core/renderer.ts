import { EMPTY_OBJ } from './../shared/index';
import { Fragment, Text } from './vnode';
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
import { shouldUpdateComponent } from './componentUpdateUtils';

// 自定义渲染器
// createElement  创建元素
// patchProp  处理prop
// insert  插入元素
export function createRenderer(options) {
    const { 
        createElement, 
        patchProp, 
        insert, 
        remove, 
        setElementText 
    } = options

    // 根组件没有parent，因此为 null
    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    // n1: oldVNode
    // n2: newVNode
    function patch(n1: any, n2: any, container: any, parent: any, anchor) {
        // 处理组件
        const { type, shapeFlag } = n2

        switch(type) {
            case Fragment:
                processFragment(n1, n2, container, parent, anchor)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 是不是 element
                    processElement(n1, n2, container, parent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 是不是 component
                    processComponent(n1, n2, container, parent, anchor)
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
    function processFragment(n1: any, n2: any, container: any, parent: any, anchor: any) {
        mountChildren(n2.children, container, parent, anchor)
    }

    // 处理标签元素 element
    function processElement(n1: any, n2: any, container: any, parent: any, anchor: any) {
        if (!n1) {
            // 挂载（初始化）
            mountElement(n2, container, parent, anchor)
        } else {
            // 更新（update）
            patchElement(n1, n2, container, parent, anchor)
        }
    }

    function patchElement(n1: any, n2: any, container: any, parent: any, anchor: any) {
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el

        patchChildren(n1, n2, el, parent, anchor)

        patchProps(el, oldProps, newProps)
    }

    // 更新 children
    function patchChildren(n1: any, n2: any, container: any, parent: any, anchor: any) {
        const prevShapeFlag = n1.shapeFlag
        const newShapeFlag  = n2.shapeFlag
        const c1 = n1.children
        const c2 = n2.children

        // 如果新的 children 是 text 类型
        // 如果旧的 children 是 array 类型，需要先移除旧 children 的挂载，再设置新的 text
        // 如果旧的 children 是 text 类型，只有当新旧文本不一致时，才需要重新设置新的 text
        if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children)
            }
            if (c1 !== c2) {
                setElementText(container, c2)
            }
        } else {
            // 如果新的 children 是 array 类型
            // 如果旧的 children 是 text 类型，需要先将旧的文本设置为 ''，然后再将新的 children 挂载到容器上
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                setElementText(container, '')
                mountChildren(c2, container, parent, anchor)
            } else {
                // 如果旧的 children 是 array 类型，比较前后两个 array
                patchKeyedChildren(c1, c2, container, parent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1: any, c2: any, container: any, parent: any, anchor: any) {
        const l2 = c2.length
        let i = 0
        let e1 = c1.length - 1
        let e2 = l2 - 1

        // 判断节点是否相同，根据 type + key
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key
        }

        // 从前往后找到第一个不相等的位置索引
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor)
            } else {
                break
            }
            i++
        }

        // 从后往前找到第一个不相等的位置索引
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parent, anchor)
            } else {
                break
            }
            e1--
            e2--
        }

        // 新的比老的多 创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            // 老的比新的多 删除
            while (i <= e1) {
                remove(c1[i].el)
                i++
            }
        } else {
            // 中间对比
            let s1 = i
            let s2 = i

            // 记录有差异的新节点数组的长度
            const toBePatch = e2 - s2 + 1
            // 记录已经比对过的节点数量
            let patched = 0
            // 建立新节点数组 key 的索引映射
            const keyToNewIndexMap = new Map()
            // 建立新旧节点下标映射
            const newIndexToOldIndexMap = new Array(toBePatch).fill(0)
            // 标记是否需要移动节点
            let moved = false
            // 标记当前新节点的最大下标
            let maxNewIndexSoFar = 0

            for(let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                // 如果比对的节点数量已经大于新节点数组的长度
                // 则直接移除旧节点
                if (patched >= toBePatch) {
                    remove(prevChild.el)
                    break
                }

                let newIndex
                if (prevChild.key != undefined) {
                    // 如果有 key 的话，直接比对 key
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    // 如果没有 key 的话，需要遍历比较
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j

                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    // 说明当前节点在新的节点中不存在 删除
                    remove(prevChild.el)
                } else {
                    if (newIndex >= maxNewIndexSoFar) {
                        // 如果新节点下标大于等于之前的下标
                        // 说明当前节点应该在前面的节点之后，不需要移动节点位置
                        // 并更新最大下标
                        maxNewIndexSoFar = newIndex
                    } else {
                        // 如果新节点下标小于之前的下标 
                        // 说明当前节点是需要移动的
                        moved = true
                    }

                    // 记录新旧节点的下标映射
                    // 新节点的下标从 0 开始
                    // 因为旧节点的下标有可能为 0，而这里定义 0 为新节点在旧节点中不存在，因此需要将旧节点的下标 +1
                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(prevChild, c2[newIndex], container, parent, null)
                    patched++
                }
            }

            // 计算最长递增子序列（如果需要移动节点的话）
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            // j 为最长递增子序列的下标
            let j = increasingNewIndexSequence.length - 1

            // 因为从头开始遍历节点的话，有可能下一个节点也是需要移动的节点，因此从后往前遍历
            for (let i = toBePatch - 1; i >= 0 ; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

                if (!newIndexToOldIndexMap[i]) {
                    // 如果新节点在旧节点中不存在，需要创建新节点
                    patch(null, nextChild, container, parent, anchor)
                } else if (moved) {
                    // 否则，如果需要移动节点的话，走这里的逻辑
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        insert(nextChild.el, container , anchor)
                    } else {
                        j--
                    }
                }
            }
        }
    }

    // 更新 props
    function patchProps(el: any, oldProps: any, newProps: any) {
        // 当旧的props不等于新的props时，才执行
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]

                // 新的值不等于旧的值，更新
                if (prevProp !== nextProp) {
                    patchProp(el, key, prevProp, nextProp)
                }
            }

            // 当旧的 props 不为空时，才执行
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    // 旧的有，新的没有，删除
                    if (!(key in newProps)) {
                        patchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    // 挂载 element
    function mountElement(vnode: any, container: any, parent: any, anchor: any) {
        const el = vnode.el = createElement(vnode.type)

        const { props, children } = vnode
        // children (string array)
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // vnode
            mountChildren(children, el, parent, anchor)
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
            patchProp(el, key, null, val)
        }

        // insert
        // container.append(el)
        insert(el, container, anchor)
    }

    function mountChildren(children: any[], container: any, parent: any, anchor) {
        children.forEach(v => {
            patch(null, v, container, parent, anchor)
        })
    }

    // 移除 children
    function unmountChildren(children: any) {
        for(let i = 0; i < children.length; i++) {
            const el = children[i].el
            remove(el)
        }
    }

    function processComponent(n1: any, n2: any, container: any, parent: any, anchor: any) {
        if (!n1) {
            // 挂载
            mountComponent(n2, container, parent, anchor)
        } else {
            // 更新
            updateComponent(n1, n2)
        }
    }

    function updateComponent(n1: any, n2: any) {
        // 获取组件实例
        // 即使不需要更新组件，也需要更新 n2 的component
        const instance = n2.component = n1.component
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            // 执行 effect
            instance.update()
        } else {
            // 更新 n2 的 el和vnode
            n2.el = n1.el
            n2.vnode = n2
        }
    }

    function mountComponent(vnode: any, container: any, parent: any, anchor: any) {
        // 将组件实例挂载到 vnode 上
        const instance = vnode.component = createComponentInstance(vnode, parent)

        setupComponent(instance)

        setupRenderEffect(instance, vnode, container, anchor)
    }

    function setupRenderEffect(instance: any, vnode: any, container: any, anchor: any) {
        // 使用 effect 做响应式
        instance.update = effect(() => {
            // 初始化
            if (!instance.isMounted) {
                const { proxy } = instance
                // 使得在 render 函数中调用 this 能够获取到 setup 返回的值
                // 并且能够使用 this.$el 等属性
                const subTree = instance.subTree = instance.render.call(proxy)

                // vnode -> patch
                // vnode -> element -> mountElement
                // subTree 的父组件就是当前组件实例 instance
                patch(null, subTree, container, instance, anchor)

                // 整棵 vnode 树挂载完成之后，将 根元素 挂载到 el 上，可以通过 $el 获取到 根元素
                vnode.el = subTree.el

                instance.isMounted = true
            } else {
                // 更新
                const { next, vnode } = instance
                if (next) {
                    next.el = vnode.el

                    updateComponentPreRender(instance, next)
                }

                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)

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

// 更新组件实例
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null

    instance.props = nextVNode.props
}

// 计算最长递增子序列的算法
function getSequence(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (let i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = (u + v) >> 1
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}