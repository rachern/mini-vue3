import { reactive, isReactive } from '../reactive'

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const origined = reactive(original)
        expect(origined).not.toBe(original)
        expect(origined.foo).toBe(1)
        expect(isReactive(origined)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })
})