// 添加类型判断，使用位运算提高性能
export const enum ShapeFlags {
    ELEMENT = 1,                    // 0001
    STATEFUL_COMPONENT = 1 << 1,    // 0010
    TEXT_CHILDREN = 1 << 2,         // 0100
    ARRAY_CHILDREN = 1 << 3         // 1000
}

// 修改 | （0 | 0 => 0, 其他情况都为 1）
//（如果一个 vnode 是组件类型同时 children 是 array 类型）
//   0010
// | 1000
// ———————
//   1010



// 判断 & （1 & 1 => 1, 其他情况都为 0）
//（判断上面的 vnode 是不是 element 类型）
//   1010
// & 0001
// ——————
//   0000    等于 0(false) 说明不是 element 类型

//（判断上面的 vnode 是不是 component 类型）
//   1010
// & 0010
// ——————
//   0010    等于 2(true) 说明是 component 类型

//（判断上面的 vnode 的 children 是不是 text 类型）
//   1010
// & 0100
// ——————
//   0000    等于 0 说明 children 不是 text 类型

//（判断上面的 vnode 的 children 是不是 array 类型）
//   1010
// & 1000
// ——————
//   1000    等于 8(true) 说明 children 是 array 类型