import { computed } from "../computed"
import { reactive } from "../reactive"

describe('computed', () => {
    it('happy path', () => {
        const user = reactive({
            age: 11
        })

        const age = computed(() => {
            return user.age
        }) 
        expect(age.value).toBe(11)
    })

    it('should compute lazily', () => {
        const user = reactive({
            age: 11
        })
        const getter = jest.fn(() => {
            return user.age
        })
        const age = computed(getter)

        // lazy
        // 调用 computed 时，不会立即执行 getter 函数
        expect(getter).not.toHaveBeenCalled()
        // 在获取 computed 的值时，触发 getter 函数
        expect(age.value).toBe(11)
        expect(getter).toHaveBeenCalledTimes(1)

        // should not compute again
        // 如果 computed 的值没有改变，不重复触发 getter 函数（缓存）
        age.value
        expect(getter).toHaveBeenCalledTimes(1)

        // should not compute until needed
        // 依赖值发生改变，不会触发 getter 函数
        user.age = 12
        expect(getter).toHaveBeenCalledTimes(1)

        // not it should compute
        // 依赖值发生改变，并且重新获取 conputed 的值，触发 getter 函数
        expect(age.value).toBe(12)
        expect(getter).toHaveBeenCalledTimes(2)

        // should not compute again
        // 如果 computed 的值没有改变，不重复触发 getter 函数（缓存）
        age.value
        expect(getter).toHaveBeenCalledTimes(2)
    })
})