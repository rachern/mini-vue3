import { hasOwn } from "../shared/index"

// 除了 $el，还会有 $data 等属性，因此将这些属性都放在一起
const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots
}

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance

        if (hasOwn(setupState, key)) {
            // 如果读取的属性在 setup 的返回对象上，则从返回对象上面取值
            return setupState[key]
        } else if (hasOwn(props, key)) {
            // 如果读取的属性在 props 上，则从 props 上取值
            return props[key]
        }
        
        const publicGettet = publicPropertiesMap[key]
        if (publicGettet) {
            return publicGettet(instance)
        }
    }
}