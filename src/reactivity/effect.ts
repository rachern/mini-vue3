import { extend } from "../shared"

let activeEffect
let shouldTrack

// ReactivityEffect 类，用于收集 fn 函数和执行 fn 函数
export class ReactiveEffect {
    private _fn: any
    deps = []
    active = true
    onStop?: () => void
    public scheduler: Function | undefined

    constructor(fn, scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }
    
    run() {
        // 如果是 stop 状态，只执行 effect 函数
        if (!this.active) {
            return this._fn()
        }


        // 如果不是 stop 状态，在执行 effect 函数的过程中
        // 会触发 get track 依赖收集
        // 会触发 set trigger 触发依赖
        shouldTrack = true
        // 当执行 fn 函数时，将 this 暴露到全局
        activeEffect = this

        const result = this._fn()

        // 执行完 effect 函数之后，需要将 shouldTrack 开关关闭，防止下次触发依赖收集
        shouldTrack = false

        return result
    }

    stop() {
        // 防止多次执行 stop
        if (this.active) {
            cleanupEffect(this)
            // 如果有 onStop 回调，需要执行 onStop
            this.onStop && this.onStop()
            this.active = false
        }
    }
}

// 用于执行 stop 时清除 effect
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    // 将 effect 清除掉之后就可以清空 effect.deps 数组了
    effect.deps.length = 0
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    // => Object.assign(_effect, options)
    extend(_effect, options)

    // 执行 fn 函数
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

// 收集依赖
// target -> key -> dep
// 会有多个 target 对象
// 每个 target 对象会有多个 key
// 每个 key 对应一个 dep
let targetMap = new WeakMap()
export function track(target, key) {
    // 如果是 stop 状态，不触发 依赖收集
    if (!isTracking()) return

    let depsMap = targetMap.get(target)
    // 当首次触发依赖收集时，depsMap 为 undefined
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    // 当首次触发依赖收集时，dep 为 undefined
    if(!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep) {
    // 如果当前依赖已经收集过了，不需要重复收集
    if (dep.has(activeEffect)) return
    // 将当前触发的实例对象收集起来
    dep.add(activeEffect)
    // 反向收集依赖，用于在 stop 时清除当前 effect
    activeEffect.deps.push(dep)
}

// 判断是否是 stop 状态
export function isTracking() {
    return shouldTrack && activeEffect !== undefined
}

// 触发依赖
// 找到 target.key 对应的 dep，依次执行
export function trigger(target, key) {
    const depsMap = targetMap.get(target)

    const dep = depsMap.get(key)

    triggerEffects(dep)
}

export function triggerEffects(dep) {
    dep.forEach(effect => {
        effect.scheduler ? effect.scheduler() : effect.run()
    });
}

// 停止 effect 响应
export function stop(runner) {
    runner.effect.stop()
}