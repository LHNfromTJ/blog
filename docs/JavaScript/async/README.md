# 异步编程

## Generator

### 定义
`Generator`函数是`ES6`对协程的实现，但属于不完全实现。`Generator`函数被称为`半协程（semi-coroutine）`，意思是只有`Generator`函数的调用者，才能将程序的执行权还给`Generator`函数。如果是完全执行的协程，任何函数都可以让暂停的协程继续执行

### 与 Iterator 接口的关系
由于`Generator`函数就是遍历器生成函数，因此可以把`Generator`赋值给对象的`Symbol.iterator`属性，从而使得该对象具有`Iterator`接口
```js
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

`Generator`函数执行后，返回一个遍历器对象。该对象本身也具有`Symbol.iterator`属性，执行后返回自身
```js
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

### next() / throw() / return() 共同点
::: tips
这三个方法其实就是将对应的调用转换为对应的语句
:::

```js
const g = function* (x, y) {
  let result = yield x + y;
  return result;
};

const gen = g(1, 2);
gen.next(); // Object {value: 3, done: false}

gen.next(1); // Object {value: 1, done: true}
// 相当于将 let result = yield x + y
// 替换成 let result = 1;

gen.throw(new Error('出错了')); // Uncaught Error: 出错了
// 相当于将 let result = yield x + y
// 替换成 let result = throw(new Error('出错了'));

gen.return(2); // Object {value: 2, done: true}
// 相当于将 let result = yield x + y
// 替换成 let result = return 2;
```

## async函数

### 与 Generator 函数的区别
+ 内置执行器
    + 不需要自行调用`next`函数
    + 不需要`co`模块
+ 更好的语义
+ 更广的适用性
    + `co`模块约定，`yield`命令后面只能是`Thunk`函数或`Promise`对象
    + `async`函数的`await`命令后面，可以是`Promise`对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即`resolved`的`Promise`对象）
+ 返回值是`Promise`

### 实现原理
```js
async function fn(args) {
  // ...
}

// 等同于

function fn(args) {
  return spawn(function* () {
    // ...
  });
}

function spawn(genF) {
  return new Promise(function(resolve, reject) {
    const gen = genF();
    function step(nextF) {
      let next;
      try {
        next = nextF();
      } catch(e) {
        return reject(e);
      }
      if(next.done) {
        return resolve(next.value);
      }
      Promise.resolve(next.value).then(function(v) {
        step(function() { return gen.next(v); });
      }, function(e) {
        step(function() { return gen.throw(e); });
      });
    }
    step(function() { return gen.next(undefined); });
  });
}
```