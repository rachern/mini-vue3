export function generate(ast) {
    // 创建一个codegen全局上下文
    const context = createCodegenContext()

    // push 进行字符串拼接
    const { push } = context
    push('return ')

    const functionName = 'render'
    const args = ['_ctx', '_cache']
    const signature = args.join(', ')
    push(`function ${functionName}(${signature}) {`)

    push('return ')
    genNode(ast.codegenNode, context)
    push('}')

    return {
        code: context.code
    }

    // "return function render(_ctx, _cache) {return 'hi'}"
}

// 创建一个codegen全局上下文
function createCodegenContext() {
    const context = {
        code: '', // 拼接的字符串
        // 用于拼接字符串
        push(source) {
            context.code += source
        }
    }

    return context
}

// 处理节点内容
function genNode(node: any, context: any) {
    const { push } = context
    push(`'${node.content}'`)
}
