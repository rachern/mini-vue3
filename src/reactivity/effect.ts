import { extend } from "../shared"

// ReactivityEffect 类，用于收集 fn 函数和执行 fn 函数
class ReactivityEffect {
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
        // 当执行 fn 函数时，将 this 暴露到全局
        activityEffect = this
        return this._fn()
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
}

let activityEffect
export function effect(fn, options: any = {}) {
    const _effect = new ReactivityEffect(fn, options.scheduler)
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

    if (!activityEffect) return

    // 将当前触发的实例对象收集起来
    dep.add(activityEffect)
    // 反向收集依赖，用于在 stop 时清除当前 effect
    activityEffect.deps.push(dep)
}

// 触发依赖
// 找到 target.key 对应的 dep，依次执行
export function trigger(target, key) {
    const depsMap = targetMap.get(target)

    const dep = depsMap.get(key)

    dep.forEach(effect => {
        effect.scheduler ? effect.scheduler() : effect.run()
    });
}

// 停止 effect 响应
export function stop(runner) {
    runner.effect.stop()
}