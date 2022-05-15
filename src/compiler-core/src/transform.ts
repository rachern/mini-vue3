import { NodeTypes } from "./ast"

export function transform(root: any, options: any = {}) {
    // 创建全局上下文对象
    const context = createTransformContext(root, options)

    // 深度优先，递归遍历
    traverseNode(root, context)

    // 获取根节点
    createRootCodegen(root)
}

function createRootCodegen(root) {
    root.codegenNode = root.children[0]
}

function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || []
    }

    return context
}

function traverseNode(node: any, context: any) {
    // 执行外部传入的处理节点的方法
    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i]
        transform(node)
    }

    // 递归执行其子节点
    traverseChildren(node, context)
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
