import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    public dep: Set<unknown>;
    private _rawValue: any;
    public __v_isRef = true
    constructor(value) {
        // 初始值（如果是对象，则保存的是转化为 proxy 之前的值），用于判断新值是否改变
        this._rawValue = value
        this._value = convert(value)
        // 因为这里只有 value 一个属性，所以只有一个依赖
        this.dep = new Set()
    }
    
    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        // 如果新的值没有改变，则不重复触发依赖
        if (!hasChanged(this._rawValue, newValue)) return
        
        this._rawValue = newValue
        this._value = convert(newValue)
        triggerEffects(this.dep)
    }
}

// 如果传入 ref 的值是一个对象，需要使用 reactive 将其转化为响应式对象
function convert(value) {
    return isObject(value) ? reactive(value) : value
}

// 依赖收集
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep) 
    }
}

export function ref(value) {
    // 返回一个 RefImpl 类，这样在获取 .value 的时候会触发 getter 函数
    // 在为 .value 赋值的时候，会触发 setter 函数
    return new RefImpl(value)
}

export function isRef(value) {
    return !!value.__v_isRef
}

export function unRef(value) {
    // 如果是 ref，需要返回 .value
    return value.__v_isRef ? value.value : value
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 如果获取到的值是 ref 对象，返回 .value 值
            return unRef(Reflect.get(target, key))
        },
        set(target, key, value) {
            // 如果原属性值是 ref 对象，并且新设置的值不是 ref 对象
            // 则需要替换 .value 值
            if(isRef(target[key]) && !isRef(value)) {
                return target[key].value = value
            } else {
                // 否则直接替换
                return Reflect.set(target, key, value)
            } 
        }
    })
}