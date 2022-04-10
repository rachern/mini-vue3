import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, ref, toRef } from "../ref"

describe('ref', () => {
    // 1. 使用 ref 之后会将值转换为 对象，通过 .value 获取原来的值
    it('happy path', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
    })

    // 2. 当修改 .value 的值的时候，会触发依赖
    // 当多次修改为相同值的时候，不会重复触发依赖
    it('should be reactive', () => {
        const a = ref(1)
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = a.value
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        a.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
        a.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
    })

    // 3. ref 还可以接收一个对象
    // 会将接收的对象转为响应式对象，同样是通过 .value 获取
    it('should make nested properties reactive', () => {
        const a = ref({
            count: 1
        })
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = a.value.count
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        a.value.count = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
        // 同样在多次修改为相同对象的时候，不会重复触发依赖
        const obj = {
            count: 3
        }
        a.value = obj
        expect(calls).toBe(3)
        expect(dummy).toBe(3)
        a.value = obj
        expect(calls).toBe(3)
        expect(dummy).toBe(3)
    })

    it('isRef', () => {
        const a = ref(1)
        const user = reactive({
            age: 11
        })
        expect(isRef(a)).toBe(true)
        expect(isRef(1)).toBe(false)
        expect(isRef(user)).toBe(false)
    })

    it('toRef', () => {
        const a = ref(1)
        expect(toRef(a)).toBe(1)
        expect(toRef(1)).toBe(1)
    })
})