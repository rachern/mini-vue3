import { isReadonly, shallowReadonly } from "../reactive"

describe('shallowReadonly', () => {
    // 只有最外层是 readonly，里面每一层都不是 readonly
    it('should not make non-reactive properties reactive', () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })

    // 触发 setter 操作时报错
    it('warn when call set', () => {
        console.warn = jest.fn()

        const user = shallowReadonly({ age: 11 })
        user.age = 12

        expect(console.warn).toBeCalled()
    })
})