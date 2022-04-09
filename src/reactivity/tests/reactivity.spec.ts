import { reactive, isReactive, isProxy } from '../reactive'

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const origined = reactive(original)
        expect(origined).not.toBe(original)
        expect(origined.foo).toBe(1)
        expect(isReactive(origined)).toBe(true)
        expect(isReactive(original)).toBe(false)
        expect(isProxy(origined)).toBe(true)
    })

    it('nested reactive', () => {
        const original = {
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })
})