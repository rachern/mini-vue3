import { createRenderer } from "../runtime-core"

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, prevVal, newVal) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        // 注册事件
        // 规则： on + Event
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, newVal)
    } else {
        // 如果新值为undefined或空，移除该属性
        if (newVal === undefined || newVal === null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, newVal)
        }
    }
}

function insert(el, parent) {
    parent.append(el)
}

// 移除当前节点
function remove(child) {
    const parent = child.parentNode
    parent && parent.removeChild(child)
}

// 设置文本节点
function setElementText(el, text) {
    el.textContent = text
}

// 渲染器
const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

// 将 createApp 暴露给用户使用
export function createApp(...args) {
    return renderer.createApp(...args)
}

// runtime-core 是底层
// runtime-dom 是上层
// 此处将 runtime-core 提供给用户的接口导出
export * from '../runtime-core'