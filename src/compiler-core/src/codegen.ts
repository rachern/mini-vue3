import { helperMapName, TO_DISPLAY_STRING, CREATE_ELEMENT_VNODE } from './runtimeHelpers';
import { NodeTypes } from "./ast"
import { isString } from '../../shared';

export function generate(ast) {
    // 创建一个codegen全局上下文
    const context = createCodegenContext()
    // push 进行字符串拼接
    const { push } = context

    // 处理前置引入
    genFunctionPreamble(ast, context)

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

function genFunctionPreamble(ast: any, context: any) {
    const { push } = context

    const VueBinging = 'Vue'
    const aliasHelpers = s => `${helperMapName[s]}: _${helperMapName[s]}`
    // 当需要引入辅助函数时
    // 形式类似于：const { toDisplayString: _toDisplayString } = Vue
    if (ast.helpers.length) {
        push(`const { ${ast.helpers.map(aliasHelpers).join(', ')} } = ${VueBinging}`)
    }
    
    push('\n')
    push('return ')
}

// 创建一个codegen全局上下文
function createCodegenContext() {
    const context = {
        code: '', // 拼接的字符串
        // 用于拼接字符串
        push(source) {
            context.code += source
        },
        helper(key) {
            return `_${helperMapName[key]}`
        }
    }

    return context
}

// 处理节点内容
function genNode(node: any, context: any) {
    switch(node.type) {
        case NodeTypes.TEXT:
            genText(node, context)
            break

        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context)
            break

        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context)
            break

        case NodeTypes.ELEMENT:
            genElement(node, context)
            break

        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context)
            break

        default:
            break
    }
}

function genCompoundExpression(node: any, context: any) {
    const { push } = context
    const { children } = node
    for(let i = 0; i < children.length; i++) {
        const child = children[i]
        if(isString(child)) {
            push(child)
        } else {
            genNode(child, context)
        }
    }
}

function genElement(node: any, context: any) {
    const { push, helper } = context
    const { tag, children, props } = node

    push(`${helper(CREATE_ELEMENT_VNODE)}(`)
    genNodeList(genNullable([tag, props, children]), context)
    // genNode(children, context)
    push(')')
}

function genNodeList(nodes: any, context: any) {
    const { push } = context

    for(let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if(isString(node)) {
            push(node)
        } else {
            genNode(node, context)
        }

        if(i < nodes.length - 1) {
            push(', ')
        }
    }
}

function genNullable(args: any) {
    return args.map(arg => arg || 'null')
}

function genExpression(node: any, context: any) {
    const { push } = context

    push(`${node.content}`)
}

function genInterpolation(node: any, context: any) {
    const { push, helper } = context

    push(`${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(')')
}

function genText(node: any, context: any) {
    const { push } = context

    push(`'${node.content}'`)
}

