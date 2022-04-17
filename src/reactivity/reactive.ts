import { isObject } from '../shared/index'
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
    // 如果是 proxy，触发 get 操作会走到 getter 函数，如果是普通对象，会返回 undefined，因此用 !! 进行转换
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    // 如果是 proxy，触发 get 操作会走到 getter 函数，如果是普通对象，会返回 undefined，因此用 !! 进行转换
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`)
    }
    return new Proxy(raw, baseHandlers)
}