import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)

    return createRoot(parseChildren(context))
}

function parseChildren(context) {
    const nodes: any = []

    let node
    const s = context.source
    // 如果 context 是以 '{{' 开头的才处理
    if (context.source.startsWith('{{')) {
        node = parseInterpolation(context)
    } else if (s[0] === '<') {
        if (/[a-z]/i.test(s[1])) {
            // 如果是以 '< + 字母' 开始，则按照标签解析
            node = parseElement(context)
        }
    } else {
        // 解析文本
        node = parseText(context)
    }
    
    nodes.push(node)

    return nodes
}

function parseText(context) {
    // 直接获取文本内容
    const content = context.source.slice(0, context.source.length)
    // 推进已经获取的文本内容长度
    advanceBy(context, context.source.length)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseElement(context) {
    const element = parseTag(context, TagType.Start)
    parseTag(context, TagType.End)

    return element
}

function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)>/.exec(context.source)

    const tag = match[1]

    advanceBy(context, match[0].length)

    // 如果是结束标签则不需要返回
    if (type === TagType.End) return

    return {
        type: NodeTypes.ELEMENT,
        tag
    }
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