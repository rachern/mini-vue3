// 除了 $el，还会有 $data 等属性，因此将这些属性都放在一起
const publicPropertiesMap = {
    $el: i => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
        }
        
        const publicGettet = publicPropertiesMap[key]
        if (publicGettet) {
            return publicGettet(instance)
        }
    }
}