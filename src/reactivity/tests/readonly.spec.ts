import { isProxy, isReadonly, readonly } from '../reactive'

describe('readonly', () => {
    // 1. readonly 会创建一个代理对象
    it('happy path', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
        expect(isProxy(wrapped)).toBe(true)
    })

    // 2. 代理对象的属性无法设置，进行设置时会报错
    it('warn when call set', () => {
        console.warn = jest.fn()

        const user = readonly({ age: 11 })
        user.age = 12

        expect(console.warn).toBeCalled()
    })

    it('nested readonly', () => {
        const original = {
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }
        const observed = readonly(original)
        expect(isReadonly(observed.nested)).toBe(true)
        expect(isReadonly(observed.array)).toBe(true)
        expect(isReadonly(observed.array[0])).toBe(true)
    })
})