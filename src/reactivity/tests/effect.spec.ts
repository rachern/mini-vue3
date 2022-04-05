import { reactivity } from '../reactivity'
import { effect } from '../effect'

describe('effect', () => {
    it('happy path', () => {
        const user = reactivity({
            age: 18
        })

        let nextAge
        effect(() => {
            // 触发 user.age getter操作，收集依赖
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(19)

        // 触发 user.age setter操作，触发依赖
        user.age++
        expect(nextAge).toBe(20)
    })
})