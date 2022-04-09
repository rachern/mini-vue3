import { reactivity, isReactivity } from '../reactivity'

describe('reactivity', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const origined = reactivity(original)
        expect(origined).not.toBe(original)
        expect(origined.foo).toBe(1)
        expect(isReactivity(origined)).toBe(true)
        expect(isReactivity(original)).toBe(false)
    })
})