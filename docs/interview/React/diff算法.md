# diff算法

1. 只同级比较，不跨级
1. 使用key作为比较的依据
1. 先序深度优先遍历
1. 利用patch（补丁包）进行更新
1. 对于类组件和函数组件，不进行diff，直接处理

```js
function diffVchildren(patches, vnode, newVnode, node, parentContext) {
    if (!node.vchildren) return // react-lite hasn't seen this DOM node before

    let { childNodes, vchildren } = node
    let newVchildren = node.vchildren = getFlattenChildren(newVnode)
    let vchildrenLen = vchildren.length
    let newVchildrenLen = newVchildren.length

    // 如果当前元素没有子元素
    if (vchildrenLen === 0) {
        // 如果更新后当前元素增加了子元素
        if (newVchildrenLen > 0) {
            for (let i = 0; i < newVchildrenLen; i++) {
                patches.creates.push({
                    vnode: newVchildren[i],
                    parentNode: node,
                    parentContext: parentContext,
                    index: i,
                })
            }
        }
        return
    } else if (newVchildrenLen === 0) { // 更新前当前元素有子元素但更新后子元素被删除了
        for (let i = 0; i < vchildrenLen; i++) {
            patches.removes.push({
                vnode: vchildren[i],
                node: childNodes[i],
            })
        }
        return
    }


    let updates = Array(newVchildrenLen)
    let removes = null
    let creates = null

    for (let i = 0; i < vchildrenLen; i++) { // 循环所有旧元素
        let vnode = vchildren[i] // 获取旧元素的vnode
        for (let j = 0; j < newVchildrenLen; j++) { // 循环所有新元素
            if (updates[j]) { // 如果这个新元素已经存在于更新队列中了，则不再重复处理
                continue
            }
            let newVnode = newVchildren[j] // 获取新元素的vnode
            if (vnode === newVnode) { // 如果新旧元素的引用相同，则放进更新队列中
                updates[j] = {
                    shouldIgnore: shouldIgnoreUpdate(node),
                    vnode: vnode,
                    newVnode: newVnode,
                    node: childNodes[i], // 直接复用之前的元素对象
                    parentContext: parentContext,
                    index: j,
                }
                vchildren[i] = null // 将这个已经处理了的旧元素置为null，防止接下来重复处理
                break
            }
        }
    }

    // isSimilar
    for (let i = 0; i < vchildrenLen; i++) { // 循环所有旧元素
        let vnode = vchildren[i] // 获取旧元素的vnode
        if (vnode === null) { // 如果这个旧元素已经被处理过了，则不再处理
            continue
        }
        let shouldRemove = true
        for (let j = 0; j < newVchildrenLen; j++) { // 循环所有新元素
            if (updates[j]) { // 如果这个新元素已经存在于更新队列中了，则不再重复处理
                continue
            }
            let newVnode = newVchildren[j] // 获取新元素的vnode
            // 如果新旧元素的类型、key、refs相同，则放进更新队列中
            if (
                newVnode.type === vnode.type &&
                newVnode.key === vnode.key &&
                newVnode.refs === vnode.refs
            ) {
                updates[j] = {
                    vnode: vnode,
                    newVnode: newVnode,
                    node: childNodes[i], // 直接复用之前的元素对象
                    parentContext: parentContext,
                    index: j,
                }
                shouldRemove = false
                break
            }
        }
        // 经过循环后，如果shouldRemove没有被置为false
        // 则说明当前的旧元素和所有新生成的元素都不相同
        if (shouldRemove) {
            if (!removes) {
                removes = []
            }
            removes.push({
                vnode: vnode,
                node: childNodes[i]
            })
        }
    }

    for (let i = 0; i < newVchildrenLen; i++) { // 循环所有新元素
        let item = updates[i]
        // 如果这个新元素没有在更新队列中
        // 说明是新增的元素
        if (!item) {
            if (!creates) {
                creates = []
            }
            creates.push({
                vnode: newVchildren[i],
                parentNode: node,
                parentContext: parentContext,
                index: i,
            })
        } else if (item.vnode.vtype === VELEMENT) { // 如果这个元素是一个原生标签不是组件，则继续diff子元素
            diffVchildren(patches, item.vnode, item.newVnode, item.node, item.parentContext)
        }
    }

    if (removes) {
        patches.removes.push(removes)
    }
    if (creates) {
        patches.creates.push(creates)
    }
    patches.updates.push(updates)
}
```
