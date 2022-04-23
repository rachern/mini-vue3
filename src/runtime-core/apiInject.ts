import { getCurrentInstance } from "./component";

// 提供用户使用的 provide 函数
export function provide(key, value) {
    // 获取当前组件实例
    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent.provides
        // 如果是在组件中第一次使用 provide，将当前组件实例的 provides 创建一个以父级 provides 为原型的对象
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        // 将 key - value 存储在当前组件实例的 provides 上
        provides[key] = value
    }
}

export function inject(key, defaultVal) {
    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        // 从当前组件实例的 父组件 的 provides 中获取值
        // 因为各级组件的 provides 之间是原型链的继承关系，所以可以取到跨组件的 provides 中的 key
        const parentProvides = currentInstance.parent.provides
        
        if (key in parentProvides) {
            // 如果能够取到值，直接返回
            return parentProvides[key]
        } else if (defaultVal) {
            // 如果取不到值，返回默认值
            if (typeof defaultVal === 'function') {
                // 如果默认值是一个函数，返回函数执行的结果
                return defaultVal()
            }
            return defaultVal
        }
    }
}