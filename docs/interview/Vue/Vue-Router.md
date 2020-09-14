# Vue-Router

## install

1. 全局注册 beforeCreate 和 destroyed 钩子
    ```javascript
    // $options.router为调用new VueRouter()后传入根组件的router对象
    this._router = this.$options.router;
    // 调用router对象的init方法，把当前组件实例传入
    this._router.init(this);
    // 在beforeCreate内调用defineReactive实现_route变化后返回最新的路由对象
    Vue.util.defineReactive(this, '_route', this._router.history.current);
    ```
1. 使用`Object.defineProperty`将`$router`和`$route`挂载到`Vue.prototype`上，实现响应式
    ```javascript
    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            return this._routerRoot._router;
        },
    });

    Object.defineProperty(Vue.prototype, '$route', {
        get() {
            return this._routerRoot._route;
        },
    });
    ```
1. 注册组件`RouterView`和`RouterLink`
    ```javascript
    Vue.component('RouterView', View);
    Vue.component('RouterLink', Link);
    ```

## VueRouter 对象

### constructor

- 调用`createMatcher`方法（具体使用见 matcher 章节）
- 对路由模式进行兼容性判断，不支持`history`模式的使用`hash`模式
- 根据路由模式的不同，`new`不同的`history`对象
    ```javascript
    switch (mode) {
        case 'history':
            this.history = new HTML5History(this, options.base);
            break;
        case 'hash':
            this.history = new HashHistory(this, options.base, this.fallback);
            break;
        case 'abstract':
            this.history = new AbstractHistory(this, options.base);
            break;
    }
    ```

### init

- 调用`transitionTo`函数

### matcher

+ `createMathcer`内部调用`createRouteMap`函数，最终返回两个函数组成的对象
    ```javascript
    return {
        match,
        addRoutes,
    };
    ```
+ `createRouteMap`的作用是对用户传入的路由配置进行处理并返回`RouteRecord`，这个`RouteRecord`未来会用来生成我们组件内部使用的`$route`对象

    ```javascript
    {
        path: normalizedPath,
        regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
        components: route.components || { default: route.component },
        instances: {},
        name,
        parent,
        matchAs,
        redirect: route.redirect,
        beforeEnter: route.beforeEnter,
        meta: route.meta || {},
        props: route.props == null
          ? {}
          : route.components
            ? route.props
            : { default: route.props }
    }
    ```

+ `addRoutes`就是 api 里的**router.addRoutes**方法，其原理就是在函数内部调用`addRouteRecord`
    ```javascript
    function addRoutes(routes) {
        createRouteMap(routes, pathList, pathMap, nameMap);
    }
    ```
