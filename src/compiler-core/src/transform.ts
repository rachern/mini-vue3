import { TO_DISPLAY_STRING } from './runtimeHelpers';
import { NodeTypes } from "./ast"

export function transform(root: any, options: any = {}) {
    // 创建全局上下文对象
    const context = createTransformContext(root, options)

    // 深度优先，递归遍历
    traverseNode(root, context)

    // 获取根节点
    createRootCodegen(root)

    root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
    const child = root.children[0]
    if(child.type === NodeTypes.ELEMENT) {
        root.codegenNode = child.codegenNode
    } else {
        root.codegenNode = root.children[0]
    }
}

function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1)
        }
    }

    return context
}

function traverseNode(node: any, context: any) {
    // 执行外部传入的处理节点的方法
    const nodeTransforms = context.nodeTransforms
    const exitFns: any = []
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i]
        const onExit = transform(node, context)
        if(onExit) exitFns.push(onExit)
    }

    switch(node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break

        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            // 递归执行其子节点
            traverseChildren(node, context)
            break

        default:
            break
    }

    let i = exitFns.length
    while(i--) {
        exitFns[i]()
    }
}

function traverseChildren(node: any, context: any) {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i]
            traverseNode(node, context)
        }
    }
}
