// 判断是否需要更新组件
// 当 新旧vNode 的 props 不相同时，需要更新组件
export function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode
    const { props: nextProps } = nextVNode

    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true
        }
    }

    return false
}