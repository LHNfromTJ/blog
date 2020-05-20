# Event Loops

## 定义
+ `JavaScript`是一种单线程的编程语言，只有一个调用栈，决定了它在同一时间只能做一件事情
+ 如果一段同步的代码耗时非常久就会阻塞GUI的渲染
+ `Event Loops`翻译出来就是事件循环，是让`JavaScript`做到既是单线程，又绝对不会阻塞的核心机制，也是`JavaScript`并发模型的基础，是用来协调`各种事件`、`用户交互`、`脚本执行`、`UI渲染`、`网络请求`等的一种机制

## JavaScript运行环境
+ 浏览器
+ 服务端（Node.js）
+ 客户端（Visual Studio Code）

## 浏览器运行环境
<table>
    <thead>
        <tr>
            <th colspan="2">浏览器内核</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>JavaScript线程</td>
            <td>
                <ul>
                    <li>负责执行执行栈的最顶层 JS 代码</li>
                    <li>和 GUI 渲染线程互斥，JS 运行耗时过长就会导致页面阻塞</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>GUI线程</td>
            <td>
                <ul>
                    <li>负责渲染页面,解析 HTML，CSS 构成 DOM 树等，当页面重绘或者由于某种操作引起回流都会调起该线程</li>
                    <li>和 JS 引擎线程是互斥的，当 JS 引擎线程在工作的时候，GUI 渲染线程会被挂起，GUI 更新被放入在 JS 任务队列中，等待 JS 引擎线程空闲的时候继续执行</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>事件监听线程</td>
            <td>
                <ul>
                    <li>当事件符合触发条件被触发时，该线程会把对应的事件回调函数添加到事件队列的队尾，等待 JS 引擎处理</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>计时线程</td>
            <td>
                <ul>
                    <li>开启定时器触发线程来计时并触发计时，计时完毕后，将计时器结束的回调函数添加到事件队列中，等待JS引擎空闲后执行，等待 JS 引擎处理</li>
                    <li>浏览器定时计数器并不是由 JS 引擎计数的，阻塞会导致计时不准确</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>网络线程</td>
            <td>
                <ul>
                    <li>Http 请求的时候会开启一条请求线程</li>
                    <li>请求完成有结果了之后，将请求的 Http 回调函数添加到任务队列中，等待 JS 引擎处理</li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>

## 浏览器内的Event Loops
+ 每个线程都有自己的`Event Loop`
+ 浏览器可以有多个`Event Loop`，`浏览器上下文`和`Web Workers`就是相互独立的
+ 所有同源的`浏览器上下文`可以共用`Event Loop`，这样它们之间就可以相互通信

## JavaScript Runtime

## Task（宏任务，也称为MacroTask）
一个`Event loops`内存在多个`Task Queue`

常见的`Task Source`：
+ script全部代码
+ setTimeout
+ setInterval
+ setImmediate
+ DOM操作
+ 用户交互
+ 网络请求
+ History API 操作

## MicroTask（微任务）
常见的`Task Source`：
+ Process.nextTick（Node独有）
+ Promise
+ MutationObserver

`Event Loop`里只有一个`Microtask Queue`

## Promise在不同浏览器的差异问题
`Promise`的定义在`ECMAScript`规范而不是在`HTML Standard`规范中。在[Promises/A+规范](https://promisesaplus.com/#notes)中提及了`Promise`的`then`方法可以采用`“宏任务（macro-task）”`机制或者`“微任务（micro-task）”`机制来实现。所以`Promise`在不同浏览器的差异正源于此，有的浏览器将then放入了`macro-task`队列，有的放入了`micro-task`队列

## Event Loops执行顺序
`Task`和`MicroTask`均使用队列管理执行顺序，即**先进先出（FIFO）**

+ 来自相同`Task Source`的`Task`，必须放在同一个`Task Queue`中
+ 来自不同`Task Source`的`Task`，可以放在不同的`Task Queue`中
+ 同一个`Task Queue`内的`Task`是按顺序执行的
+ 但对于不同的`Task Queue（Task Source）`，浏览器会进行调度，允许优先执行来自特定`Task Source`的`Task`