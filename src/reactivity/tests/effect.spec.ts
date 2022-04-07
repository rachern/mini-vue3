import { reactivity } from '../reactivity'
import { effect, stop } from '../effect'

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

    it('should return runner when call effect', () => {
        let foo = 10

        const runner = effect(() => {
            foo++
            return 'runner'
        })

        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('runner')
    })

    it('scheduler', () => {
        // 1. 通过 effect 的第二个参数给定一个 scheduler 的 fn
        // 2. effect 第一次执行的时候 还会执行 fn
        // 3. 当响应式对象 set update 不会执行 fn 而是执行 scheduler
        // 4. 当执行 runner 的时候，会再次执行 effect
        let dummy
        let run
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactivity({ foo: 1 })
        const runner = effect(() => {
            dummy = obj.foo
        }, { scheduler })
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)

    })

    it('stop', () => {
        let dummy
        const obj = reactivity({ foo: 1 })
        const runner = effect(() => {
            dummy = obj.foo
        })
        // 执行 get 操作时，调用 effect
        obj.foo = 2
        expect(dummy).toBe(2)
        // 执行 stop 之后，再次执行 get 操作时，不再调用 effect
        stop(runner)
        obj.foo = 3
        expect(dummy).toBe(2)
        // 调用 runner，执行 effect
        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        const obj = reactivity({ foo: 1 })
        const onStop = jest.fn()
        let dummy
        const runner = effect(() => {
            dummy = obj.foo
        }, {
            onStop
        })

        stop(runner)
        expect(onStop).toHaveBeenCalledTimes(1)
    })
})