import { ReactiveEffect } from './effect';

class ComputedRefImpl {
    private _dirty: Boolean = true
    private _value: any
    private _effect: ReactiveEffect;
    constructor(getter) {
        // 当依赖值发生改变时，触发 scheduler 函数，将 _dirty 标志置为 true
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value() {
        // 如果 _dirty 标志为 true，说明没有计算属性值，或者计算属性的值发生改变，需要重新执行 getter 函数
        // 否则不执行 getter 函数，直接返回之前缓存的值
        if (this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}