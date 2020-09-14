# Vue

## Vue.use

```javascript
Vue.use = function (plugin /* 可以传函数或者对象 */) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 这里做一个重复判断，如果插件已经注册过了直接返回this
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    const args = toArray(arguments, 1)
    // 把Vue实例作为第一个参数放入args中
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
}
```
