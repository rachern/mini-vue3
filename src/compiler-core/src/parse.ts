import { NodeTypes } from "./ast"

export function baseParse(content: string) {
    const context = createParserContext(content)

    return createRoot(parseChildren(context))
}

function parseChildren(context) {
    const nodes: any = []

    let node
    // 如果 context 是以 '{{' 开头的才处理
    if (context.source.startsWith('{{')) {
        node = parseInterpolation(context)
    }
    
    nodes.push(node)

    return nodes
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'

    // 获取结束符号的位置
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    // 截取开始符号之后的内容
    advanceBy(context, openDelimiter.length)
    
    // 获取有效内容的长度
    const rawContentLength = closeIndex - openDelimiter.length

    // 获取有效内容
    const rawContent = context.source.slice(0, rawContentLength)
    // 去掉有效内容的空格
    const content = rawContent.trim()

    // 截去已处理的内容
    advanceBy(context, rawContentLength + closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context: any, length: number) {
    context.source = context.source.slice(length)
}

function createRoot(children) {
    return {
        children
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}