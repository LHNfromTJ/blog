# Es6

## let 和 const 命令

+ ES5 规定，函数只能在顶层作用域和函数作用域之中声明，不能在块级作用域声明
+ ES6 引入了块级作用域，明确允许在块级作用域之中声明函数
+ ES6 在附录 B 里面规定，浏览器的实现可以不遵守上面的规定，有自己的行为方式
    + 允许在块级作用域内声明函数
    + 函数声明类似于var，即会提升到全局作用域或函数作用域的头部
    + 同时，函数声明还会提升到所在的块级作用域的头部
        ```js
        // 浏览器的 ES6 环境
        function f() { console.log('I am outside!'); }
        (function () {
            var f = undefined;
            if (false) {
                function f() { console.log('I am inside!'); }
            }

            f();
        }());
        // Uncaught TypeError: f is not a function
        ```
+ ES6 的块级作用域必须有大括号，如果没有大括号，JavaScript 引擎就认为不存在块级作用域
    ```js
    // 第一种写法，报错
    if (true) let x = 1;

    // 第二种写法，不报错
    if (true) {
        let x = 1;
    }
    ```
+ 不存在变量提升
+ 暂时性死区
+ 不允许重复声明
+ `let`命令、`const`命令、`class`命令声明的全局变量，不属于顶层对象的属性

## 变量的解构赋值

+ 如果解构的变量名与属性名不一致，必须写成下面这样
    ```js
    let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
    baz // "aaa"

    let obj = { first: 'hello', last: 'world' };
    let { first: f, last: l } = obj;
    f // 'hello'
    l // 'world'
    ```
+ 嵌套赋值
    ```js
    let obj = {};
    let arr = [];

    ({ foo: obj.prop, bar: arr[0] } = { foo: 123, bar: true });

    obj // {prop:123}
    arr // [true]
    ```
+ 由于数组本质是特殊的对象，因此可以对数组进行对象属性的解构
    ```js
    let arr = [1, 2, 3];
    let {0 : first, [arr.length - 1] : last} = arr;
    first // 1
    last // 3
    ```
+ 解构赋值时，如果等号右边是数值和布尔值，则会先转为对象
    ```js
    let {toString: s} = 123;
    s === Number.prototype.toString // true

    let {toString: s} = true;
    s === Boolean.prototype.toString // true
    ```
+ 解构赋值的规则是，只要等号右边的值不是对象或数组，就先将其转为对象。由于undefined和null无法转为对象，所以对它们进行解构赋值，都会报错
    ```js
    let { prop: x } = undefined; // TypeError
    let { prop: y } = null; // TypeError
    ```

## 字符串的扩展

+ 标签模板
    ```js
    alert`hello`
    // 等同于
    alert(['hello'])

    let a = 5;
    let b = 10;

    tag`Hello ${ a + b } world ${ a * b }`;
    // 等同于
    tag(['Hello ', ' world ', ''], 15, 50);
    ```

## 字符串的新增方法

+ String.row
    ```js
    // 实际返回 "Hi\\u000A!"，显示的是转义后的结果 "Hi\u000A!"
    String.raw`Hi\u000A!`;
    // 如果原字符串的斜杠已经转义，那么String.raw()会进行再次转义
    String.raw`Hi\\n` // 返回 "Hi\\\\n"
    ```

+ 实例方法：includes, startsWith, endsWith
    + includes()：返回布尔值，表示是否找到了参数字符串
    + startsWith()：返回布尔值，表示参数字符串是否在原字符串的头部
    + endsWith()：返回布尔值，表示参数字符串是否在原字符串的尾部
    ```js
    let s = 'Hello world!';

    s.startsWith('Hello') // true
    s.endsWith('!') // true
    s.includes('o') // true
    ```

+ 实例方法：repeat
    ```js
    // repeat方法返回一个新字符串，表示将原字符串重复n次
    'x'.repeat(3) // "xxx"

    // 参数如果是小数，会被取整
    'na'.repeat(2.9) // "nana"

    // 如果repeat的参数是负数或者Infinity，会报错

    // 如果参数是 0 到-1 之间的小数，则等同于 0，这是因为会先进行取整运算。0 到-1 之间的小数，取整以后等于-0，repeat视同为 0
    'na'.repeat(-0.9) // ""

    // 参数NaN等同于 0
    'na'.repeat(NaN) // ""

    // 如果repeat的参数是字符串，则会先转换成数字
    'na'.repeat('na') // ""
    'na'.repeat('3') // "nanana"
    ```

+ 实例方法：padStart, padEnd
    ```js
    // padStart()和padEnd()一共接受两个参数，第一个参数是字符串补全生效的最大长度，第二个参数是用来补全的字符串
    'x'.padStart(5, 'ab') // 'ababx'
    'x'.padStart(4, 'ab') // 'abax'
    ```

+ 实例方法：trimStart, trimEnd
    ```js
    // trimStart()消除字符串头部的空格，trimEnd()消除尾部的空格。它们返回的都是新字符串，不会修改原始字符串
    const s = '  abc  ';

    s.trim() // "abc"
    s.trimStart() // "abc  "
    s.trimEnd() // "  abc"
    ```

## 数值的拓展

+ Number().isFinite() / Number().isNaN()
    + 它们与传统的全局方法`isFinite()`和`isNaN()`的区别在于，传统方法先调用`Number()`将非数值的值转为数值，再进行判断，而这两个新方法只对数值有效，`Number.isFinite()`对于非数值一律返回**false**, `Number.isNaN()`只有对于`NaN`才返回**true**，非`NaN`一律返回**false**
        ```js
        Number.isFinite(15); // true
        Number.isFinite(Infinity); // false
        Number.isFinite(-Infinity); // false
        Number.isFinite(NaN); // 非数字，一律返回false

        Number.isNaN(NaN) // true
        Number.isNaN(9/NaN) // true
        Number.isNaN('true' / 0) // true
        Number.isNaN('true' / 'true') // true
        ```

## 函数的扩展
+ 一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域（context）。等到初始化结束，这个作用域就会消失。这种语法行为，在不设置参数默认值时，是不会出现的
+ ES2019 做出了改变，允许catch语句省略参数
    ```js
    try {
        ...
    } catch {
        ...
    }
    ```

## 数组的拓展
+ `Array.from`用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）

+ `entries()`是对键值对的遍历，返回一个遍历器对象
    ```js
    for (let [index, elem] of ['a', 'b'].entries()) {
        console.log(index, elem);
    }
    // 0 "a"
    // 1 "b"
    ```

+ `includes()`返回一个布尔值，表示某个数组是否包含给定的值，与字符串的`includes`方法类似

+ `flat()`用于将嵌套的数组“拉平”，变成一维的数组
    ```js
    [1, 2, [3, 4]].flat() // [1, 2, 3, 4]

    // flat()默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将flat()方法的参数写成一个整数，表示想要拉平的层数，默认为1，如果想拉平多层数据，可以传入一个整数或Infinity
    [1, [2, [3]]].flat(Infinity) // [1, 2, 3]
    ```

## 对象的拓展
+ ES6 一共有 5 种方法可以遍历对象的属性
    1. for...in
        + 遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）
    1. Object.keys(obj)
        + 返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名
    1. Object.getOwnPropertyNames(obj)
        + 返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名
    1. Object.getOwnPropertySymbols(obj)
        + 返回一个数组，包含对象自身的所有 Symbol 属性的键名
    1. Reflect.ownKeys(obj)
        + 返回一个数组，包含对象自身的所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举
+ 链判断运算符
    ```js
    const firstName = message?.body?.user?.firstName || 'default';
    ```
    + 链判断运算符有三种用法
        1. obj?.prop // 对象属性
        1. obj?.[expr] // 同上
        1. func?.(...args) // 函数或对象方法的调用
+ `null`判断运算符
    ```js
    // ES2020 引入了一个新的 Null 判断运算符??。它的行为类似||，但是只有运算符左侧的值为null或undefined时，才会返回右侧的值
    const headerText = response.settings.headerText ?? 'Hello, world!';
    const animationDuration = response.settings.animationDuration ?? 300;
    const showSplashScreen = response.settings.showSplashScreen ?? true;
    ```

+ Object.setPrototypeOf
    + `Object.setPrototypeOf`方法的作用与`__proto__`相同，用来设置一个对象的`prototype`对象，返回参数对象本身。它是 ES6 正式推荐的设置原型对象的方法
        ```js
        Object.setPrototypeOf(object, prototype)
        // 等同于
        function setPrototypeOf(obj, proto) {
        obj.__proto__ = proto;
        return obj;
        }
        ```
+ Object.setPrototypeOf
    + 该方法与`Object.setPrototypeOf`方法配套，用于读取一个对象的原型对象

+ Object.fromEntries()
    ```js
    // 该方法是Object.entries()的逆操作，用于将一个键值对数组转为对象
    Object.fromEntries([
        ['foo', 'bar'],
        ['baz', 42]
    ])
    // { foo: "bar", baz: 42 }
    ```

## Reflect

+ 将`Object`对象的一些明显属于语言内部的方法（比如`Object.defineProperty`），放到`Reflect`对象上。现阶段，某些方法同时在`Object`和`Reflect`对象上部署，未来的新方法将只部署在`Reflect`对象上。也就是说，从`Reflect`对象上可以拿到语言内部的方法
+ 修改某些`Object`方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)`在无法定义属性时，会抛出一个错误，而`Reflect.defineProperty(obj, name, desc)`则会返回`false`
+ 让`Object`操作都变成函数行为。某些`Object`操作是命令式，比如`name in obj`和`delete obj[name]`，而`Reflect.has(obj, name)`和`Reflect.deleteProperty(obj, name)`让它们变成了函数行为
+ `Reflect`对象的方法与`Proxy`对象的方法一一对应，只要是`Proxy`对象的方法，就能在`Reflect`对象上找到对应的方法。这就让`Proxy`对象可以方便地调用对应的`Reflect`方法，完成默认行为，作为修改行为的基础。也就是说，不管`Proxy`怎么修改默认行为，你总可以在`Reflect`上获取默认行为
