import { track, trigger } from './effect'
import { ReactivityFlags } from './reactivity'

// 利用缓存，避免每次调用都需要创建新的函数
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

// reactivity 和 readonly 的 getter 差别在于：
// reactivity 需要收集依赖，而 readonly 不需要
function createGetter(isReadonly = false) {
    return function (target, key) {
        // 因为 reactivity 和 readonly 的 getter 函数通过 isReadonly 区分
        // 所以同样利用 isReadonly 区分 isReactivity 和 isReadonly
        if (key === ReactivityFlags.IS_REACTIVITY) {
            return !isReadonly
        } else if (key === ReactivityFlags.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)
        // 收集依赖
        if (!isReadonly) {
            track(target, key)
        }
        return res
    }
}

// reactivity 可以设置属性值，而 readonly 不可以
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    // readonly 进行属性设置时会报错
    set(target, key, value) {
        console.warn(`key: ${key} setting fail because ${target} is readonly`)
        return true
    }
}