// ReactivityEffect 类，用于收集 fn 函数和执行 fn 函数
class ReactivityEffect {
    private _fn: any
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
}

let activityEffect
export function effect(fn, options: any = {}) {
    const _effect = new ReactivityEffect(fn, options.scheduler)

    // 执行 fn 函数
    _effect.run()

    return _effect.run.bind(_effect)
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

    // 将当前触发的实例对象收集起来
    dep.add(activityEffect)
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