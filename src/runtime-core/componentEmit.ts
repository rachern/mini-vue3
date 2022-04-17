import { camelize, toHandlerKey } from "../shared/index"

export function emit(instance, event, ...arg) {
    const { props } = instance

    // TPP
    // 先写一个特定行为 -> 重构为通用行为
    // 触发事件 on + Event
    const handlerName = toHandlerKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...arg)
}