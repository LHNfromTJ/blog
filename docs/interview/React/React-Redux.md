# React-Redux

## Provider
```js
/*
* 初始化做了2件事
* 1、new Subscription并返回了上下文的初始对象，里面包括了用户传进来的store和subscription实例
* 2、向redux的subscribe函数传入了listener，保证了未来在dispatch之后可以调用Subscription的notify通知变更
* */
const ReactReduxContext = React.createContext(null)

function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription
    }
  }, [store])

  const previousState = useMemo(() => store.getState(), [store])

  useEffect(() => {
    const { subscription } = contextValue
    // 这一步会向redux的subscribe函数传入listener（handleChangeWrapper）
    // 而这个listener在dispatch的会被调用从而执行subscription实例的onStateChange函数
    // 而onStateChange函数实则调用的是subscription实例的notifyNestedSubs函数
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export default Provider
```

## connect
+ connectAdvanced为connect实现的核心函数
+ 该函数为一个函数式组件，接收props
+ 该函数内部使用``Context.Provider``在外层包裹了用户传入的组件并将融合好props传入
+ 当组件触发dispatch的时候改变了顶层树状态，必定会触发组件的重新渲染
+ react-redux内部通过useLayoutEffect钩子对状态做了缓存判断，当缓存的值发生变化才会重新渲染组件
