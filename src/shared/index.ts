export const extend = Object.assign

export const EMPTY_OBJ = {}

export function isObject(val) {
    return val !== null && typeof val === 'object'
}

export function hasChanged(val, newVal) {
    return !Object.is(val, newVal)
}

export function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key)
}

// 将形如 add-foo -> addFoo
export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : ''
    })
}

// 将首字母大写 如 add -> Add
const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// 拼接成 on 事件 如 add -> onAdd
export const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(str) : ''
}