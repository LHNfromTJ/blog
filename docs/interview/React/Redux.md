# Redux

## createStore

```js
function createStore(
    reducer, // 如果使用了combineReducers，这个reducer就是combineReducers返回的函数combination
    preloadedState, // preloadedState为对象或函数
    enhancer // enhancer是一个高阶函数，用于返回经过自定义处理后的store
) {
    // preloadedState为函数一般用于使用中间件的情况
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState
        preloadedState = undefined
    }

    if (typeof enhancer !== 'undefined') {
        // 使用中间件的情况，详情看applyMiddleware.ts
        return enhancer(createStore)(reducer, preloadedState)
    }

    let currentReducer = reducer
    let currentState = preloadedState // preloadedState为对象则代表为初始state
    let currentListeners = []
    let nextListeners = currentListeners
    let isDispatching = false // dispatch函数是否在运行中的标识

    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice()
        }
    }

    function getState() {
        if (isDispatching) {
            throw new Error(
                'You may not call store.getState() while the reducer is executing. ' +
                'The reducer has already received the state as an argument. ' +
                'Pass it down from the top reducer instead of reading it from the store.'
            )
        }

        return currentState // getState直接返回当前state对象
    }

    function subscribe(listener) {
        if (isDispatching) {
            throw new Error(
                'You may not call store.subscribe() while the reducer is executing. ' +
                'If you would like to be notified after the store has been updated, subscribe from a ' +
                'component and invoke store.getState() in the callback to access the latest state. ' +
                'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
            )
        }

        let isSubscribed = true

        ensureCanMutateNextListeners()
        nextListeners.push(listener)

        return function unsubscribe() {
            if (!isSubscribed) {
                return
            }

            if (isDispatching) {
                throw new Error(
                    'You may not unsubscribe from a store listener while the reducer is executing. ' +
                    'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
                )
            }

            isSubscribed = false

            ensureCanMutateNextListeners()
            const index = nextListeners.indexOf(listener)
            nextListeners.splice(index, 1)
            currentListeners = null
        }
    }

    function dispatch(action) {
        // 判断是否为简单对象
        // 简单对象为通过字面量或new Object()定义的对象
        // 原型链只有一层
        if (!isPlainObject(action)) {
            throw new Error(
                'Actions must be plain objects. ' +
                'Use custom middleware for async actions.'
            )
        }

        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions.')
        }

        try {
            isDispatching = true
            currentState = currentReducer(currentState, action) // 调用reducer函数，生成state树
        } finally {
            isDispatching = false
        }

        const listeners = (currentListeners = nextListeners)
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i]
            listener()
        }

        return action
    }

    function replaceReducer(nextReducer) {
        currentReducer = nextReducer

        dispatch({type: ActionTypes.REPLACE})

        return store
    }

    function observable() {
        const outerSubscribe = subscribe
        return {
            subscribe(observer) {
                function observeState() {
                    const observerAsObserver = observer
                    if (observerAsObserver.next) {
                        observerAsObserver.next(getState())
                    }
                }

                observeState()
                const unsubscribe = outerSubscribe(observeState)
                return {unsubscribe}
            },

            [$$observable]() {
                return this
            }
        }
    }

    // 做一次初始化调用，构建整个状态树
    dispatch({type: ActionTypes.INIT})

    const store = {
        dispatch,
        subscribe,
        getState,
        replaceReducer,
        [$$observable]: observable
    }

    return store
}

```

## combineReducers

```javascript
function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers)
    const finalReducers = {}
    // 循环传入的需要合并的reducer函数
    for (let i = 0; i < reducerKeys.length; i++) {
        const key = reducerKeys[i]

        // 复制一份
        if (typeof reducers[key] === 'function') {
            finalReducers[key] = reducers[key]
        }
    }
    const finalReducerKeys = Object.keys(finalReducers)

    // 返回combination，这个函数就是在dispatch的时候内部调用的currentReducer函数
    return function combination(state = {}, action) {
        let hasChanged = false
        const nextState = {}
        // 循环所有的reducer
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i]
            const reducer = finalReducers[key]
            const previousStateForKey = state[key]
            // 获取新的state状态
            const nextStateForKey = reducer(previousStateForKey, action)
            nextState[key] = nextStateForKey
            // 判断state有没有更新
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }
        hasChanged =
            hasChanged || finalReducerKeys.length !== Object.keys(state).length
        return hasChanged ? nextState : state
    }
}
```

## applyMiddleware & compose

```javascript
function compose(...funcs) {
    // 使用reduce实现中间件的一元链式调用
    return funcs.reduce(function (a, b) {
        return function (...args) {
            return a(b(...args));
        }
    })
}

function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (
            reducer, // 如果使用了combineReducers，这个reducer就是combineReducers返回的函数combination
            ...args
        ) {
            // 获取初始状态
            const store = createStore(reducer, ...args)
            let dispatch = () => {
                throw new Error(
                    'Dispatching while constructing your middleware is not allowed. ' +
                    'Other middleware would not be applied to this dispatch.'
                )
            }

            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action, ...args) => dispatch(action, ...args)
            }
            // 循环调用传入的中间件函数，形成一个链式结构
            const chain = middlewares.map(middleware => middleware(middlewareAPI))
            dispatch = compose(...chain)(store.dispatch)

            return {
                ...store,
                dispatch
            }
        }
    }
}
```
