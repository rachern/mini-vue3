import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactivityFlags {
    IS_REACTIVITY = '__v_isReactivity',
    IS_READONLY = '__v_isReadonly'
}

export function reactivity(raw) {
    return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function isReactivity(value) {
    // 如果是 proxy，触发 get 操作会走到 getter 函数，如果是普通对象，会返回 undefined，因此用 !! 进行转换
    return !!value[ReactivityFlags.IS_REACTIVITY]
}

export function isReadonly(value) {
    // 如果是 proxy，触发 get 操作会走到 getter 函数，如果是普通对象，会返回 undefined，因此用 !! 进行转换
    return !!value[ReactivityFlags.IS_READONLY]
}

function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}