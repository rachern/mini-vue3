import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)

    return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
    const nodes: any = []

    // 循环处理各种类型
    while(!isEnd(context, ancestors)) {
        let node
        const s = context.source
        // 如果 context 是以 '{{' 开头的才处理
        if (context.source.startsWith('{{')) {
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                // 如果是以 '< + 字母' 开始，则按照标签解析
                node = parseElement(context, ancestors)
            }
        } else {
            // 解析文本
            node = parseText(context)
        }
        
        nodes.push(node)
    }
    
    return nodes
}

// 判断是否结束
// 结束条件：1.结束标签 2.长度为0
function isEnd(context, ancestors) {
    const s = context.source
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }

    return !context.source
}

function parseText(context) {
    // 文本后面可能是标签，也可能是插值
    let endIndex = context.source.length
    let endTokens = ['{{', '<']

    // 获取更靠近文本开始的结束符号的下标
    for(let i = 0; i <= endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }

    // 直接获取文本内容
    const content = context.source.slice(0, endIndex)
    // 推进已经获取的文本内容长度
    advanceBy(context, endIndex)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseElement(context, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    // 处理标签时，需要判断标签是否配套
    // 因为标签有可能嵌套，所以使用栈来存储
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    // 当处理完一层配套的标签，就可以将处理完的标签从栈中移除
    ancestors.pop()

    if (startsWithEndTagOpen(context.source, element.tag)) {
        // 处理结束标签的时候，需要先判断是否和之前的标签是配套的
        parseTag(context, TagType.End)
    } else {
        // 如果没有配套的结束标签，抛出异常
        throw new Error(`缺少结束标签：${element.tag}`)
    }

    return element
}

// 判断结束标签是否和开始标签配套
function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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
        type: NodeTypes.ROOT,
        children
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}