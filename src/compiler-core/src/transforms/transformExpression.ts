import { NodeTypes } from "../ast";

// 处理插值表达式
export function transformExpression(node: any) {
    if(node.type === NodeTypes.INTERPOLATION) {
        node.content = processExpression(node.content)
    }
}

function processExpression(node: any) {
    node.content = `_ctx.${node.content}`
    return node
}