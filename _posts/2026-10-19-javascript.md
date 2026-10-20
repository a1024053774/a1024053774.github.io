---
layout: post
title: "JavaScript 入门到进阶"
subtitle: "从基础语法、函数与标准对象，到面向对象、DOM、jQuery 与 Node.js"
date: 2026-10-19 20:30:00 -0400
permalink: /javascript/
author: LuckyE
header-style: text
catalog: true
comments: false
tags:
  - JavaScript
  - Web
home_excerpt: "一份覆盖 JavaScript 基础语法、函数、对象与浏览器编程的完整学习笔记。"
---

JavaScript是世界上最流行的脚本语言，因为在**电脑、手机、平板上浏览的所有的网页**，以及无数基于HTML5的手机App，**交互逻辑都是由JavaScript驱动的**。

> 简单地说，JavaScript是一种运行在浏览器中的解释型的编程语言。

在Web世界里，只有JavaScript能跨平台、跨浏览器驱动网页，与用户交互。

## 1.快速入门

JavaScript代码可以直接嵌在网页的任何地方

1. 通常都把JavaScript代码放到`<head>`中：

```html
<html>
<head>
    <script>
        alert('Hello, world');
    </script>
</head>
<body>
    ...
</body>
</html>
```

1. 把JavaScript代码放到一个单独的`.js`文件，然后在HTML中通过`<script src="..."></script>`引入这个文件：

```html
<html>
<head>
    <script src="/static/js/abc.js"></script>
</head>
<body>
    ...
</body>
</html>
```

### 1.1 **基本语法**

JavaScript的语法和Java语言类似，每个语句以`;`结束,语句块用`{...}`。

### 1.2 **数据类型和变量**

#### **Number**

JavaScript不区分整数和浮点数，统一用Number表示，以下都是合法的Number类型：

```javascript
123; // 整数123
0.456; // 浮点数0.456
1.2345e3; // 科学计数法表示1.2345x1000，等同于1234.5
-99; // 负数
NaN; // NaN表示Not a Number，当无法计算结果时用NaN表示
Infinity; // Infinity表示无限大，当数值超过了JavaScript的Number所能表示的最大值时，就表示为Infinity

```

> JavaScript的Number不区分整数和浮点数，也就是说，`12.00 === 12`
> 

#### **字符串**

字符串是以单引号'或双引号"括起来的任意文本，比如`'abc'`，`"xyz"`等等。请注意，`''`或`""`本身只是一种表示方式，不是字符串的一部分，因此，字符串`'abc'`只有`a`，`b`，`c`这3个字符。

#### **布尔值**

一个布尔值只有`true`、`false`两种值，要么是`true`，要么是`false`，可以直接用`true`、`false`表示布尔值，也可以通过布尔运算计算出来：

```javascript
true; // 这是一个true值
false; // 这是一个false值
2 > 1; // 这是一个true值
2 >= 3; // 这是一个false值
```

#### **比较运算符**

JavaScript允许对任意数据类型做比较：

```javascript
false == 0; // true
false === 0; // false
```

第一种是`==`比较，它会**自动转换数据类型再比较**，*很多时候，会得到非常诡异的结果*；

第二种是`===`比较，它**不会自动转换数据类型**，如果数据类型不一致，返回`false`，如果一致，再比较。

`NaN`这个特殊的Number与所有其他值都不相等，包括它自己：

```javascript
NaN === NaN; // false
```

唯一能判断`NaN`的方法是通过`isNaN()`函数：

```javascript
isNaN(NaN); // true
```

最后要注意浮点数的相等比较：

```javascript
1 / 3 === (1 - 2 / 3); // false
```

这不是JavaScript的设计缺陷。浮点数在运算过程中会产生误差，因为计算机无法精确表示无限循环小数。要比较两个浮点数是否相等，只能计算它们之差的绝对值，看是否小于某个阈值：

```javascript
Math.abs(1 / 3 - (1 - 2 / 3)) < 0.0000001; // true
```

#### **BigInt**

要精确表示比253还大的整数，可以使用内置的BigInt类型，它的表示方法是在整数后加一个`n`，例如`9223372036854775808n`，也可以使用`BigInt()`把Number和字符串转换成BigInt：

```javascript
// 使用BigInt:
var bi1 = 9223372036854775807n;
var bi2 = BigInt(12345);
var bi3 = BigInt("0x7fffffffffffffff");
console.log(bi1 === bi2); // false
console.log(bi1 === bi3); // true
console.log(bi1 + bi2);
```

#### **null和undefined**

在其他语言中，也有类似JavaScript的`null`的表示，例如Java也用`null`，Swift用`nil`，Python用`None`表示。但是，在JavaScript中，还有一个和`null`类似的`undefined`，它表示“未定义”。

JavaScript的设计者希望**用`null`表示一个空的值**，而`undefined`表示值未定义。事实证明，这并没有什么卵用，区分两者的意义不大。大多数情况下，我们都应该用`null`。`undefined`仅仅在判断函数参数是否传递的情况下有用。

#### **数组**

JavaScript的数组可以包括任意数据类型。例如：

```javascript
[1, 2, 3.14, 'Hello', null, true];
```

上述数组包含6个元素。数组用`[]`表示，元素之间用`,`分隔。

另一种创建数组的方法是通过`Array()`函数实现：

```javascript
new Array(1, 2, 3); // 创建了数组[1, 2, 3]
```

然而，出于代码的可读性考虑，强烈建议直接使用`[],` 数组的元素可以通过索引来访问。

#### **对象**

JavaScript的对象是一组由**键-值组成的无序集合**，例如：

```javascript
var person = {
    name: 'Bob',
    age: 20,
    tags: ['js', 'web', 'mobile'],
    city: 'Beijing',
    hasCar: true,
    zipcode: null
};
```

JavaScript对象的**键都是字符串类型**，**值可以是任意数据类型**。上述`person`对象一共定义了6个键值对，其中每个键又称为对象的属性，例如，`person`的`name`属性为`'Bob'`，`zipcode`属性为`null`。

要获取一个对象的属性，我们用`对象变量.属性名`的方式：

```javascript
person.name; // 'Bob'
person.zipcode; // null
```

#### **变量**

在JavaScript中，使用等号`=`对变量进行赋值。可以把任意数据类型赋值给变量，同一个变量可以反复赋值，而且可以是不同类型的变量，**但是要注意只能用`var`申明一次**，例如：

```javascript
var a = 123; // a的值是整数123
a = 'ABC'; // a变为字符串
```

这种变量本身类型不固定的语言称之为动态语言，与之对应的是静态语言。静态语言在定义变量时必须指定变量类型，如果赋值的时候类型不匹配，就会报错。例如Java是静态语言，赋值语句如下：

```java
int a = 123; // a是整数类型变量，类型用int申明
a = "ABC"; // 错误：不能把字符串赋给整型变量
```

#### **strict模式**

如果一个变量**没有通过`var`申明**就被使用，那么该**变量就自动被申明为全局变量**：

```javascript
i = 10; // i现在是全局变量
```

在同一个页面的不同的JavaScript文件中，如果都不用`var`申明，恰好都使用了变量`i`，将造成变量`i`互相影响，产生难以调试的错误结果。

**使用`var`申明的变量则不是全局变量，它的范围被限制在该变量被申明的函数体内**，同名变量在不同的函数体内互不冲突。

为了修补JavaScript这一严重设计缺陷，ECMA在后续规范中推出了strict模式，在strict模式下运行的JavaScript代码，**强制通过`var`申明变量，未使用`var`申明变量就使用的，将导致运行错误。**

启用strict模式的方法是在JavaScript代码的第一行写上：

```javascript
'use strict';
```

另一种申明变量的方式是`let`，这也是现代JavaScript推荐的方式：

```javascript
// 用let申明变量:
let s = 'hello';
console.log(s);

```

### 1.3 字符串

如果字符串内部既包含`'`又包含`"`怎么办？可以用转义字符`\`来标识，比如：

```javascript
'I\'m \"OK\"!'; // I'm "OK"!
```

转义字符`\`可以转义很多字符，比如`\n`表示换行，`\t`表示制表符，字符`\`本身也要转义，所以`\\`表示的字符就是`\`。

#### **多行字符串**

由于多行字符串用`\n`写起来比较费事，所以最新的ES6标准新增了一种多行字符串的表示方法，用反引号`...`表示：

```javascript
`这是一个
多行
字符串`;
```

#### **模板字符串**

要把多个字符串连接起来，可以用`+`号连接：

```javascript
let name = '小明';
let age = 20;
let message = '你好, ' + name + ', 你今年' + age + '岁了!';
alert(message);
```

如果有很多变量需要连接，用`+`号就比较麻烦。ES6新增了一种模板字符串，表示方法和上面的多行字符串一样，但是它会自动替换字符串中的变量：

```javascript
let name = '小明';
let age = 20;
let message = `你好, ${name}, 你今年${age}岁了!`;
alert(message);
```

#### **操作字符串**

获取字符串长度：

```javascript
let s = 'Hello, world!';
s.length; // 13
```

要获取字符串某个指定位置的字符，使用类似Array的下标操作，索引号从0开始：

```javascript
let s = 'Hello, world!';

s[0]; // 'H'
s[6]; // ' '
s[7]; // 'w'
s[12]; // '!'
s[13]; // undefined 超出范围的索引不会报错，但一律返回undefined
```

#### **toUpperCase**

`toUpperCase()`把一个字符串全部变为大写：

```javascript
let s = 'Hello';
s.toUpperCase(); // 返回'HELLO'
```

#### **toLowerCase**

`toLowerCase()`把一个字符串全部变为小写：

```javascript
let s = 'Hello';
let lower = s.toLowerCase(); // 返回'hello'并赋值给变量lower
lower; // 'hello'
```

#### **indexOf**

`indexOf()`会搜索指定字符串出现的位置：

```javascript
let s = 'hello, world';
s.indexOf('world'); // 返回7
```

#### **substring**

`substring()`返回指定索引区间的子串：

```javascript
let s = 'hello, world'
s.substring(0, 5); // 从索引0开始到5（不包括5），返回'hello'
s.substring(7); // 一位的话从第一位开始到结束，返回'world'
```

### 1.4**数组**

JavaScript的`Array`可以包含任意数据类型，并通过索引来访问每个元素。

```javascript
let arr = ['A', 'B', 'C'];
console.log(arr.length); // 3
// 调整数组大小:
arr.length = 6;
console.log(arr); // arr变为['A', 'B', 'C', undefined, undefined, undefined]
// 调整数组大小:
arr.length = 2;
console.log(arr); // arr变为['A', 'B']

```

***请注意***，如果通过索引赋值时，索引超过了范围，同样会引起`Array`大小的变化：

```javascript
// 索引超出范围会导致数组大小自动调整:
let arr = ['A', 'B', 'C'];
arr[5] = 'x';
console.log(arr); // arr变为['A', 'B', 'C', undefined, undefined, 'x']

```

#### **indexOf**

与String类似，`Array`也可以通过`indexOf()`来搜索一个指定的元素的位置：

```javascript
let arr = [10, 20, '30', 'xyz'];
arr.indexOf(10); // 元素10的索引为0
arr.indexOf(20); // 元素20的索引为1
arr.indexOf(30); // 元素30没有找到，返回-1
arr.indexOf('30'); // 元素'30'的索引为2
```

#### **slice**

`slice()`就是对应String的`substring()`版本，它截取`Array`的部分元素，然后返回一个新的`Array`：

```javascript
let arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
arr.slice(0, 3); // 从索引0开始，到索引3结束，但不包括索引3: ['A', 'B', 'C']
arr.slice(3); // 从索引3开始到结束: ['D', 'E', 'F', 'G']
```

如果不给`slice()`传递任何参数，它就会**从头到尾截取所有元素**。利用这一点可以很容易地复制一个`Array`：

```javascript
let arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let aCopy = arr.slice();
aCopy; // ['A', 'B', 'C', 'D', 'E', 'F', 'G']
aCopy === arr; // false
```

#### **push和pop**

`push()`向`Array`的末尾添加若干元素，`pop()`则把`Array`的最后一个元素删除掉：

```javascript
let arr = [1, 2];
arr.push('A', 'B'); // 返回Array新的长度: 4
arr; // [1, 2, 'A', 'B']
arr.pop(); // pop()返回'B'
arr; // [1, 2, 'A']
arr.pop(); arr.pop(); arr.pop(); // 连续pop 3次
arr; // []
arr.pop(); // 空数组继续pop不会报错，而是返回undefined
arr; // []
```

#### **unshift和shift—向Array 头部修改元素**

如果要往`Array`的头部添加若干元素，使用`unshift()`方法，`shift()`方法则把`Array`的第一个元素删掉：

```javascript
let arr = [1, 2];
arr.unshift('A', 'B'); // 返回Array新的长度: 4
arr; // ['A', 'B', 1, 2]
arr.shift(); // 'A'
arr; // ['B', 1, 2]
arr.shift(); arr.shift(); arr.shift(); // 连续shift 3次
arr; // []
arr.shift(); // 空数组继续shift不会报错，而是返回undefined
arr; // []
```

#### **sort**

**`sort()`可以对当前`Array`进行排序，它会直接修改当前`Array`的元素位置**，直接调用时，按照默认顺序排序：

```javascript
let arr = ['B', 'C', 'A'];
arr.sort();
arr; // ['A', 'B', 'C']
```

#### **reverse**

`reverse()`把整个`Array`的元素给调个个，也就是**反转**：

```javascript
let arr = ['one', 'two', 'three'];
arr.reverse();
arr; // ['three', 'two', 'one']
```

#### **splice**

`splice()`方法是修改`Array`的“万能方法”，它可以从指定的索引开始删除若干元素，然后再从该位置添加若干元素：

```javascript
let arr = ['Microsoft', 'Apple', 'Yahoo', 'AOL', 'Excite', 'Oracle'];
// 从索引2开始删除3个元素,然后再添加两个元素:
arr.splice(2, 3, 'Google', 'Facebook'); // 返回删除的元素 ['Yahoo', 'AOL', 'Excite']
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
// 只删除,不添加:
arr.splice(2, 2); // ['Google', 'Facebook']
arr; // ['Microsoft', 'Apple', 'Oracle']
// 只添加,不删除:
arr.splice(2, 0, 'Google', 'Facebook'); // 返回[],因为没有删除任何元素
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
```

#### **concat**

`concat()`方法**把当前的`Array`和另一个`Array`连接起来**，并返回一个新的`Array`：

```javascript
let arr = ['A', 'B', 'C'];
let added = arr.concat([1, 2, 3]);
added; // ['A', 'B', 'C', 1, 2, 3]
arr; // ['A', 'B', 'C']
```

***请注意***，`concat()`方法并没有修改当前`Array`，而是**返回了一个新的`Array`**。

实际上，`concat()`方法**可以接收任意个元素和`Array`**，并且**自动把`Array`拆开**，然后全部添加到新的`Array`里：

```javascript
let arr = ['A', 'B', 'C'];
arr.concat(1, 2, [3, 4]); // ['A', 'B', 'C', 1, 2, 3, 4]
```

#### **join**

`join()`方法是一个非常实用的方法，它**把当前`Array`的每个元素都用指定的字符串连接起来**，然后**返回连接后的字符串**：

```javascript
let arr = ['A', 'B', 'C', 1, 2, 3];
arr.join('-'); // 'A-B-C-1-2-3'
```

#### **多维数组**

如果数组的某个元素又是一个`Array`，则可以形成多维数组，例如：

```javascript
let arr = [[1, 2, 3], [400, 500, 600], '-'];
```

上述`Array`包含3个元素，其中头两个元素本身也是`Array`。

### 1.5 对象

JavaScript的对象是一种无序的集合数据类型，它由若干键值对组成。

JavaScript用一个`{...}`表示一个对象，键值对以`xxx: xxx`形式申明，用`,`隔开。

> 注意，**最后一个键值对不需要在末尾加`,`**，如果加了，有的浏览器（如低版本的IE）将报错。
> 

如果属性名包含特殊字符，就必须用`''`括起来：

```javascript
let xiaohong = {
		name: '小红',
		'middle-school': 'No.1 School'
};
```

访问这个属性也**无法使用`.`操作符**，必须用`['xxx']`来访问：

```javascript
xiaohong['middle-school']; // 'No.1 Middle School'
xiaohong['name']; // '小红'
xiaohong.name; // '小红'
```

#### **JavaScript的对象是动态类型，可以自由地给一个对象添加或删除属性：**

```javascript
let xiaoming = {
    name: '小明'
};
xiaoming.age; // undefined  访问一个不存在的属性会返回undefined
xiaoming.age = 18; // 新增一个age属性
xiaoming.age; // 18
delete xiaoming.age; // 删除age属性
xiaoming.age; // undefined
delete xiaoming['name']; // 删除name属性
xiaoming.name; // undefined
delete xiaoming.school; // 删除一个不存在的school属性也不会报错
```

不过要小心，如果`in`判断一个属性存在，这个属性不一定是`xiaoming`的，它可能**是`xiaoming`继承得到的**：

```javascript
'toString' in xiaoming; // true
```

因为`toString`定义在`object`对象中，而**所有对象最终都会在原型链上指向`object`**，所以`xiaoming`也拥有`toString`属性。

要判断一个属性是否是`xiaoming`自身拥有的，而不是继承得到的，可以用`hasOwnProperty()`方法：

```javascript
let xiaoming = {
    name: '小明'
};
xiaoming.hasOwnProperty('name'); // true
xiaoming.hasOwnProperty('toString'); // false
```

### 1.6条件判断

如果`if`的条件判断语句结果不是`true`或`false`怎么办？例如：

```javascript
let s = '123';
if (s.length) { // 条件计算结果为3
    //
}
```

JavaScript**把`null`、`undefined`、`0`、`NaN`和空字符串`''`视为`false`**，其他值一概视为`true`，因此上述代码条件判断的结果是`true`。

### 1.7 循环

`for`循环的3个条件都是可以省略的，如果没有退出循环的判断条件，就必须使用`break`语句退出循环，否则就是死循环：

```javascript
let x = 0;
for (;;) { // 将无限循环下去
    if (x > 100) {
        break; // 通过if判断来退出循环
    }
    x ++;
}
```

#### **for ... in**

`for`循环的一个变体是`for ... in`循环，它可以把一个对象的所有属性依次循环出来：

```javascript
let o = {
    name: 'Jack',
    age: 20,
    city: 'Beijing'
};
for (let key in o) {
    if (o.hasOwnProperty(key)) {
        console.log(key); // 'name', 'age', 'city'
    }
}
```

由于`Array`也是对象，而它的每个元素的索引被视为对象的属性，因此，`for ... in`循环可以直接循环出`Array`的索引：

```javascript
let a = ['A', 'B', 'C'];
for (let i in a) {
    console.log(i); // '0', '1', '2'
    console.log(a[i]); // 'A', 'B', 'C'
}
```

***请注意***，`for ... in`对`Array`的循环得到的**是`String`**而不是`Number`。

#### **while**

`while`循环只有一个判断条件，**条件满足，就不断循环，条件不满足时则退出循环**。比如我们要计算100以内所有奇数之和，可以用while循环实现：

```javascript
let x = 0;
let n = 99;
while (n > 0) {
    x = x + n;
    n = n - 2;
}
x; // 2500
```

#### **do ... while**

最后一种循环是`do { ... } while()`循环，它和`while`循环的唯一区别在于，不是在每次循环开始的时候判断条件，而是**在每次循环完成的时候判断条件**：

```javascript
let n = 0;
do {
    n = n + 1;
} while (n < 100);
n; // 100
```

用`do { ... } while()`循环要小心，**循环体会至少执行1次**，而`for`和`while`循环则可能一次都不执行。

### 1.8 **Map和Set**

JavaScript的默认对象表示方式`{}`可以视为其他语言中的`Map`或`Dictionary`的数据结构，即一组键值对。

JavaScript的对象有个小问题，就是**键必须是字符串,** 但实际上**Number或者其他数据类型作为键**也是非常合理的, 为了解决这个问题，最新的ES6规范引入了新的数据类型`Map`。

#### **Map**

`Map`是一组键值对的结构，具有极快的查找速度。

初始化`Map`需要一个二维数组，或者直接初始化一个空`Map`。`Map`具有以下方法：

```javascript
let m = new Map(); // 空Map
m.set('Adam', 67); // 添加新的key-value
m.set('Bob', 59);
m.has('Adam'); // 是否存在key 'Adam': true
m.get('Adam'); // 67
m.delete('Adam'); // 删除key 'Adam'
m.get('Adam'); // undefined
```

由于一个key只能对应一个value，所以，**多次对一个key放入value，后面的值会把前面的值覆盖**：

```javascript
let m = new Map();
m.set('Adam', 67);
m.set('Adam', 88);
m.get('Adam'); // 88
```

#### **Set**

`Set`和`Map`类似，也是**一组key的集合，但不存储value**。由于key不能重复，所以在`Set`中，没有重复的key。

要创建一个`Set`，**需要提供一个`Array`作为输入**，或者直接创建一个空`Set`：

```javascript
let s1 = new Set(); // 空Set
let s2 = new Set([1, 2, 3]); // 含1, 2, 3
```

重复元素在`Set`中自动被过滤：

```javascript
let s = new Set([1, 2, 3, 3, '3']);
s; // Set {1, 2, 3, "3"}
```

注意数字`3`和字符串`'3'`是不同的元素。

通过`add(key)`方法可以添加元素到`Set`中，可以重复添加，但不会有效果：

```javascript
s.add(4);
s; // Set {1, 2, 3, 4}
s.add(4);
s; // 仍然是 Set {1, 2, 3, 4}
```

通过`delete(key)`方法可以删除元素：

```javascript
let s = new Set([1, 2, 3]);
s; // Set {1, 2, 3}
s.delete(3);
s; // Set {1, 2}
```

### 1.9 **iterable**

为了统一集合类型，ES6标准引入了新的`iterable`类型，`Array`、`Map`和`Set`都属于`iterable`类型, 具有`iterable`类型的集合可以**通过新的`for ... of`循环来遍历**。

用`for ... of`循环遍历集合，用法如下：

```javascript
let a = ['A', 'B', 'C'];
let set = new Set(['A', 'B', 'C']);
let m = new Map([[1, 'x'], [2, 'y'], [3, 'z']]);

for (let x of a) { // 遍历Array
    console.log(x);
}
for (let x of s) { // 遍历Set
    console.log(x);
}
for (let x of m) { // 遍历Map
    console.log(x[0] + '=' + x[1]);
}
```

<aside class="article-note" markdown="1">
💡

`for ... of`循环和`for ... in`循环有何区别？

`for ... in`循环由于历史遗留问题，它遍历的实际上是对象的属性名称。一个`Array`数组实际上也是一个对象，它的每个元素的索引被视为一个属性。

当手动给`Array`对象添加了额外的属性后，`for ... in`循环将带来意想不到的意外效果：

```javascript
let a = ['A', 'B', 'C'];
a.name = 'Hello';
for (let x in a) {
    console.log(x); // '0', '1', '2', 'name'
}
```

`for ... in`循环将把`name`包括在内，但`Array`的**`length`属性却不包括在内**。

`for ... of`循环则完全修复了这些问题，它**只循环集合本身的元素**：

```javascript
let a = ['A', 'B', 'C'];
a.name = 'Hello';
for (let x of a) {
    console.log(x); // 'A', 'B', 'C'
}
```

这就是为什么要引入新的`for ... of`循环。

</aside>

#### forEach

更好的方式是直接使用`iterable`内置的`forEach`方法，它**接收一个函数**，每次迭代就自动回调该函数。以`Array`为例：

```javascript
let a = ['A', 'B', 'C'];
a.forEach(function (element, index, array) {
    // element: 指向当前元素的值
    // index: 指向当前索引
    // array: 指向Array对象本身
    console.log(`${element}, index = ${index}`);
});

A, index = 0 B, index = 1 C, index = 2
```

`Set`与`Array`类似，但`Set`没有索引，因此回调函数的前两个参数都是元素本身：

```javascript
let s = new Set(['A', 'B', 'C']);
s.forEach(function (element, sameElement, set) {
    console.log(element);
});
```

`Map`的回调函数参数依次为`value`、`key`和`map`本身：

```javascript
let m = new Map([[1, 'x'], [2, 'y'], [3, 'z']]);
m.forEach(function (value, key, map) {
    console.log(value);
});
```

如果对某些参数不感兴趣，由于JavaScript的函数调用不要求参数必须一致，因此可以忽略它们。例如，只需要获得`Array`的`element`：

```javascript
let a = ['A', 'B', 'C'];
a.forEach(function (element) {
    console.log(element);
});
```

## 2.函数

函数体内部的语句在执行时，一旦执行到`return`时，函数就执行完毕，并将结果返回。因此，函数内部通过条件判断和循环可以实现非常复杂的逻辑。

如果没有`return`语句，函数执行完毕后也会返回结果，只是结果为`undefined`。

创建方法 1:

- `function`指出这是一个函数定义；

创建方法 2: `function (x) { ... }`是一个匿名函数，它没有函数名. 这个匿名函数赋值给了变量`abs`

```javascript
function abs(x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}
```

```javascript
let abs = function (x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
};

```

由于JavaScript允许传入任意个参数而不影响调用，因此**传入的参数比定义的参数多也没有问题**，虽然函数内部并不需要这些参数：

```javascript
abs(10, 'blablabla'); // 返回10
abs(-9, 'haha', 'hehe', null); // 返回9
```

传入的参数比定义的少: 此时`abs(x)`函数的参数`x`将收到`undefined`，计算结果为`NaN`。

```javascript
abs(); // 返回NaN
```

#### **arguments**

JavaScript还有一个免费赠送的关键字`arguments`, 只在**函数内部起作用**，并且永远**指向当前函数的调用者传入的所有参数**

```javascript
function foo(x) {
    console.log('x = ' + x); // 10
    for (let i=0; i<arguments.length; i++) {
        console.log('arg ' + i + ' = ' + arguments[i]); // 10, 20, 30
    }
}
foo(10, 20, 30);
```

#### **rest参数**

JavaScript函数允许接收任意个参数，rest 用于获取传入的其他参数

```javascript
function foo(a, b, ...rest) {
    console.log('a = ' + a);
    console.log('b = ' + b);
    console.log(rest);
}

foo(1, 2, 3, 4, 5);
// 结果:
// a = 1
// b = 2
// Array [ 3, 4, 5 ]

foo(1);
// 结果:
// a = 1
// b = undefined
// Array []

```

传入的参数先绑定`a`、`b`，多余的参数以数组形式交给变量`rest`，所以不再需要`arguments`就获取了全部参数。

#### return的一个细节

JavaScript引擎有一个在**行末自动添加分号的机制**

如果把return语句拆成两行：

```javascript
function foo() {
    return
        { name: 'foo' };
}

foo(); // undefined
```

***要小心了***，由于JavaScript引擎在行末自动添加分号的机制，上面的代码实际上变成了：

```javascript
function foo() {
    return; // 自动添加了分号，相当于return undefined;
        { name: 'foo' }; // 这行语句已经没法执行到了
}
```

**所以正确的多行写法是：**

```javascript
function foo() {
    return { // 这里不会自动加分号，因为{表示语句尚未结束
        name: 'foo'
    };
}
```

### 2.2**变量作用域与解构赋值**

在JavaScript中，用`var`申明的变量实际上是有作用域的。

如果一个变量**在函数体内部申明，则该变量的作用域为整个函数体**，在函数体外不可引用该变量：

JavaScript的函数可以嵌套，此时，**内部函数可以访问外部函数定义的变量**，反过来则不行：

```javascript
function foo() {
    var x = 1;
    function bar() {
        var y = x + 1; // bar可以访问foo的变量x!
    }
    var z = y + 1; // ReferenceError! foo不可以访问bar的变量y!
}
```

#### **变量提升**

JavaScript的函数定义有个特点，它会先扫描整个函数体的语句，把所有用`var`申明的**变量“提升”到函数顶部**：

```javascript
function foo() {
    var x = 'Hello, ' + y;
    console.log(x);
    var y = 'Bob';
}

foo();
```

虽然是strict模式，但语句`var x = 'Hello, ' + y;`并不报错，原因是变量`y`在稍后申明了。但是`console.log`显示`Hello, undefined`，**说明变量`y`的值为`undefined`**。这正是因为JavaScript引擎**自动提升了变量`y`的声明，但不会提升变量`y`的赋值**。

对于上述`foo()`函数，JavaScript引擎看到的代码相当于：

```javascript
function foo() {
    var y; // 提升变量y的申明，此时y为undefined
    var x = 'Hello, ' + y;
    console.log(x);
    y = 'Bob';
}
```

由于JavaScript的这一怪异的“特性”，我们在函数内部定义变量时，请严格遵守“在函数内部首先申明所有变量”这一规则。

最常见的做法是用一个`var`申明函数内部用到的所有变量：

```javascript
function foo() {
    var
        x = 1, // x初始化为1
        y = x + 1, // y初始化为2
        z, i; // z和i为undefined
    // 其他语句:
    for (i=0; i<100; i++) {
        ...
    }
}
```

<aside class="article-note" markdown="1">
💡

建议使用let申明变量，避免var申明变量时带来的隐患。

</aside>

#### **全局作用域**

**不在任何函数内定义的变量就具有全局作用域。**实际上，JavaScript默认有一个全局对象`window`，全局作用域的变量实际上被绑定到`window`的一个属性：

```javascript
var course = 'Learn JavaScript';
console.log(course); // 'Learn JavaScript'
console.log(window.course); // 'Learn JavaScript'
```

因此，直接访问全局变量`course`和访问`window.course`是完全一样的。

由于函数定义有两种方式，以变量方式`var foo = function () {}`定义的函数实际上也是一个全局变量，因此，顶层函数的定义也被视为一个全局变量，并绑定到`window`对象：

```javascript
function foo() {
    alert('foo');
}

foo(); // 直接调用foo()
window.foo(); // 通过window.foo()调用
```

#### **名字空间**

全局变量会绑定到`window`上，**不同的JavaScript文件如果使用了相同的全局变量**，或者定义了相同名字的顶层函数，***都会造成命名冲突***，并且很难被发现。

减少冲突的一个方法是**把自己的所有变量和函数全部绑定到一个全局变量中**。例如：

```javascript
// 唯一的全局变量MYAPP:
let MYAPP = {};

// 其他变量:
MYAPP.name = 'myapp';
MYAPP.version = 1.0;

// 其他函数:
MYAPP.foo = function () {
    return 'foo';
};
```

> 把自己的代码全部放入唯一的名字空间`MYAPP`中，会大大减少全局变量冲突的可能, 许多著名的JavaScript库都是这么干的：jQuery，YUI，underscore等等。
> 

#### **局部作用域**

由于JavaScript的**变量作用域实际上是函数内部**，在`for`循环等语句块中是无法定义具有局部作用域的变量的：

```javascript
function foo() {
    for (var i=0; i<100; i++) {
        //
    }
    i += 100; // 仍然可以引用变量i
}
```

为了解决块级作用域，ES6引入了新的关键字`let`，用`let`替代`var`可以申明一个块级作用域的变量：

```javascript
function foo() {
    let sum = 0;
    for (let i=0; i<100; i++) {
        sum += i;
    }
    // SyntaxError:
    i += 1;
}
```

#### **常量**

由于`var`和`let`申明的是变量，如果要申明一个常量，在ES6之前是不行的，我们通常用全部大写的变量来表示“这是一个常量，不要修改它的值”：

```javascript
let PI = 3.14;
```

ES6标准引入了新的**关键字`const`来定义常量**，`const`与`let`都具有块级作用域：

```javascript
const PI = 3.14;
PI = 3; // 某些浏览器不报错，但是无效果！
PI; // 3.14
```

#### **解构赋值**

从ES6开始，JavaScript引入了解构赋值，可以同时对一组变量进行赋值。

什么是解构赋值？传统的做法，如何把一个数组的元素分别赋值给几个变量：

```javascript
let array = ['hello', 'JavaScript', 'ES6'];
let x = array[0];
let y = array[1];
let z = array[2];
```

现在，在ES6中，可以使用解构赋值，直接对多个变量同时赋值：

```javascript
// 如果浏览器支持解构赋值就不会报错:
let [x, y, z] = ['hello', 'JavaScript', 'ES6'];

// x, y, z分别被赋值为数组对应元素:
console.log(`x = ${x}, y = ${y}, z = ${z}`);
```

如果数组本身还有嵌套，也可以通过下面的形式进行解构赋值，注意嵌套层次和位置要保持一致：

```javascript
let [x, [y, z]] = ['hello', ['JavaScript', 'ES6']];
x; // 'hello'
y; // 'JavaScript'
z; // 'ES6'
```

解构赋值还可以忽略某些元素：

```javascript
let [, , z] = ['hello', 'JavaScript', 'ES6']; // 忽略前两个元素，只对z赋值第三个元素
z; // 'ES6'
```

从一个对象中取出若干属性，也可以使用解构赋值，便于快速获取对象的指定属性：

```javascript
let person = {
    name: '小明',
    age: 20,
    gender: 'male',
    passport: 'G-12345678',
    school: 'No.4 middle school',
    address: {
        city: 'Beijing',
        street: 'No.1 Road',
        zipcode: '100001'
    }
};
let {name, address: {city, zip}} = person;
name; // '小明'
city; // 'Beijing'
zip; // undefined, 因为属性名是zipcode而不是zip
// 注意: address不是变量，而是为了让city和zip获得嵌套的address对象的属性:
address; // Uncaught ReferenceError: address is not defined

```

如果要使用的变量名和属性名不一致，可以用下面的语法获取：

```javascript
let person = {
    name: '小明',
    age: 20,
    gender: 'male',
    passport: 'G-12345678',
    school: 'No.4 middle school'
};

// 把passport属性赋值给变量id:
let {name, passport:id} = person;
name; // '小明'
id; // 'G-12345678'
// 注意: passport不是变量，而是为了让变量id获得passport属性:
passport; // Uncaught ReferenceError: passport is not defined

```

解构赋值还可以使用默认值，这样就避免了不存在的属性返回`undefined`的问题：

```javascript
let person = {
    name: '小明',
    age: 20,
    gender: 'male',
    passport: 'G-12345678'
};

// 如果person对象没有single属性，默认赋值为true:
let {name, single=true} = person;
name; // '小明'
single; // true
```

#### **使用场景**

解构赋值在很多时候可以大大简化代码。例如，交换两个变量`x`和`y`的值，不再需要临时变量：

```javascript
let x=1, y=2;
[x, y] = [y, x]
```

快速获取当前页面的域名和路径：

```javascript
let {hostname:domain, pathname:path} = location;
```

如果一个函数接收一个对象作为参数，那么，可以使用解构直接把对象的属性绑定到变量中。例如，下面的函数可以快速创建一个`Date`对象：

```javascript
function buildDate({year, month, day, hour=0, minute=0, second=0}) {
    return new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
}
```

它的方便之处在于传入的对象只需要`year`、`month`和`day`这三个属性：

```javascript
buildDate({ year: 2017, month: 1, day: 1 });
// Sun Jan 01 2017 00:00:00 GMT+0800 (CST)
```

也可以传入`hour`、`minute`和`second`属性：

```javascript
buildDate({ year: 2017, month: 1, day: 1, hour: 20, minute: 15 });
// Sun Jan 01 2017 20:15:00 GMT+0800 (CST)
```

使用解构赋值可以减少代码量，但是，需要在支持ES6解构赋值特性的现代浏览器中才能正常运行。

### 2.3 **方法**

在JavaScript中，对象的定义是这样的：

```javascript
let xiaoming = {
    name: '小明',
    birth: 1990
};
```

但是，如果我们给`xiaoming`绑定一个函数，就可以做更多的事情。比如，写个`age()`方法，返回`xiaoming`的年龄：

```javascript
let xiaoming = {
    name: '小明',
    birth: 1990,
    age: function () {
        let y = new Date().getFullYear();
        return y - this.birth;
    }
};

xiaoming.age; // function xiaoming.age()
xiaoming.age(); // 今年调用是25,明年调用就变成26了
```

绑定到对象上的函数称为方法，和普通函数也没啥区别

#### this

在一个方法内部，`this`是一个特殊变量，它始终指向当前对象，也就是`xiaoming`这个变量。所以，`this.birth`可以拿到`xiaoming`的`birth`属性。

```javascript
'use strict';

let xiaoming = {
    name: '小明',
    birth: 1990,
    age: function () {
        let that = this; // 在方法内部一开始就捕获this
        function getAgeFromBirth() {
            let y = new Date().getFullYear();
            return y - that.birth; // 用that而不是this
        }
        return getAgeFromBirth();
    }
};

xiaoming.age(); // 25
```

用`let that = this;`，就可以放心地在方法内部定义其他函数，而不是把所有语句都堆到一个方法中。

#### **apply && call**

虽然在一个独立的函数调用中，根据是否是strict模式，`this`指向`undefined`或`window`，**还是可以控制`this`的指向的！**

要指定函数的`this`指向哪个对象，可以用函数本身的`apply`方法，它接收两个参数，第一个参数就是需要绑定的`this`变量，第二个参数是`Array`，表示函数本身的参数。

用`apply`修复`getAge()`调用：

```javascript
function getAge() {
    let y = new Date().getFullYear();
    return y - this.birth;
}

let xiaoming = {
    name: '小明',
    birth: 1990,
    age: getAge
};

xiaoming.age(); // 25
getAge.apply(xiaoming, []); // 25, this指向xiaoming, 参数为空
```

另一个与`apply()`类似的方法是`call()`，唯一区别是：

- `apply()`把参数打包成`Array`再传入；
- `call()`把参数按顺序传入。

比如调用`Math.max(3, 5, 4)`，分别用`apply()`和`call()`实现如下：

```javascript
Math.max.apply(null, [3, 5, 4]); // 5
Math.max.call(null, 3, 5, 4); // 5
```

#### **装饰器**

利用`apply()`还可以动态改变函数的行为。

JavaScript的所有对象都是动态的，即使**内置的函数也可以重新指向新的函数**。

现在假定想统计一下代码一共调用了多少次`parseInt()`，可以把所有的调用都找出来，然后手动加上`count += 1`，不过这样做太傻了。最佳方案是用自己的函数替换掉默认的`parseInt()`：

```javascript
'use strict';

let count = 0;
let oldParseInt = parseInt; // 保存原函数

window.parseInt = function () {
    count += 1;
    return oldParseInt.apply(null, arguments); // 调用原函数
};

// 测试:
parseInt('10');
parseInt('20');
parseInt('30');
console.log('count = ' + count); // 3

```

### 2.4 高阶函数

JavaScript的函数其实都指向某个变量。既然变量可以指向函数，函数的参数能接收变量，那么**一个函数就可以接收另一个函数作为参数**，这种函数就称之为高阶函数。

#### 2.4.1 **map/reduce**

##### **map**

举例说明，比如有一个函数f(x)=x2，要把这个函数作用在一个数组`[1, 2, 3, 4, 5, 6, 7, 8, 9]`上，就可以用`map`实现,`map()`方法定义在JavaScript的`Array`中，**调用`Array`的`map()`方法**，传入自己的函数，就得到了一个新的`Array`作为结果：

![把函数依次作用于数组元素，得到每个元素平方后的新数组]({{ site.baseurl }}/img/in-post/2026-10-19-javascript/array-map.png){: width="640" height="596" loading="lazy" decoding="async" }

```javascript
function pow(x) {
    return x * x;
}

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let results = arr.map(pow); 
// [1, 4, 9, 16, 25, 36, 49, 64, 81]
console.log(results);

```

##### **reduce**

再看reduce的用法。Array的`reduce()`把一个函数作用在这个`Array`的`[x1, x2, x3...]`上，这个函数必须接收两个参数，**`reduce()`把结果继续和序列的下一个元素做累积计算**，其效果就是：

```javascript
[x1, x2, x3, x4].reduce(f) = f(f(f(x1, x2), x3), x4)
```

比方说对一个`Array`求和，就可以用`reduce`实现：

```javascript
let arr = [1, 3, 5, 7, 9];
arr.reduce(function (x, y) {
    return x + y;
}); // 25
```

```javascript
let arr = [1, 3, 5, 7, 9];
arr.reduce(function (x, y) {
    return x + y;
}); // 25
```

##### filter

和`map()`不同的是，`filter()`把传入的函数依次作用于每个元素，然后根据返回值是`true`还是`false`决定保留还是丢弃该元素。

例如，在一个`Array`中，删掉偶数，只保留奇数，可以这么写：

```javascript
let arr = [1, 2, 4, 5, 6, 9, 10, 15];
let r = arr.filter(function (x) {
    return x % 2 !== 0;
});
r; // [1, 5, 9, 15]
```

把一个`Array`中的空字符串删掉，可以这么写：

```javascript
let arr = ['A', '', 'B', null, undefined, 'C', '  '];
let r = arr.filter(function (s) {
    return s && s.trim(); // 注意：IE9以下的版本没有trim()方法
});
r; // ['A', 'B', 'C']
```

可见用`filter()`这个高阶函数，关键在于正确实现一个“筛选”函数。

### 2.5 闭包

#### **函数作为返回值**

高阶函数除了可以接受函数作为参数外，还可以**把函数作为结果值返回**。

实现一个对`Array`的求和。通常情况下，求和的函数是这样定义的：

```javascript
function sum(arr) {
    return arr.reduce(function (x, y) {
        return x + y;
    });
}

sum([1, 2, 3, 4, 5]); // 15
```

但是，如果不需要立刻求和，而是在后面的代码中，根据需要再计算怎么办？**可以不返回求和的结果，而是返回求和的函数！**

```javascript
unction lazy_sum(arr) {
    let sum = function () {
        return arr.reduce(function (x, y) {
            return x + y;
        });
    }
    return sum;
}
```

当我们调用`lazy_sum()`时，返回的并不是求和结果，而是求和函数：

```javascript
let f = lazy_sum([1, 2, 3, 4, 5]); // function sum()
```

调用函数`f`时，才真正计算求和的结果：

```javascript
f(); // 15
```

请再注意一点，当我们调用`lazy_sum()`时，每次调用都会返回一个新的函数，即使传入相同的参数, `f1()`和`f2()`的调用结果互不影响.

```javascript
let f1 = lazy_sum([1, 2, 3, 4, 5]);
let f2 = lazy_sum([1, 2, 3, 4, 5]);
f1 === f2; // false
```

#### **闭包**

注意到返回的函数在其定义内部引用了局部变量`arr`，所以，**当一个函数返回了一个函数后，其内部的局部变量还被新函数引用**，闭包用起来简单，实现起来可不容易。

返回的函数并没有立刻执行，而是直到调用了`f()`才执行,来看一个例子：

```javascript
function count() {
    let arr = [];
    for (var i=1; i<=3; i++) {
        arr.push(function () {
            return i * i;
        });
    }
    return arr;
}

let results = count();
let [f1, f2, f3] = results;
```

在上面的例子中，每次循环，都创建了一个新的函数，然后，把创建的3个函数都添加到一个`Array`中返回了。

你可能认为调用`f1()`，`f2()`和`f3()`结果应该是`1`，`4`，`9`，但实际结果是：

```javascript
f1(); // 16
f2(); // 16
f3(); // 16
```

全部都是`16`！原因就在于返回的函数引用了用`var`定义的变量`i`，但它并非立刻执行。**等到3个函数都返回时，它们所引用的变量`i`已经变成了`4`，因此最终结果为`16`。**

返回闭包时牢记的一点就是：**返回函数不要引用任何循环变量，或者后续会发生变化的变量。**

### **2.6箭头函数**

ES6标准新增了一种新的函数：箭头函数（Arrow Function）。

为什么叫箭头函数？因为它的定义用的就是一个箭头：

```javascript
x => x * x
```

上面的箭头函数相当于：

```javascript
function (x) {
    return x * x;
}
```

**箭头函数相当于匿名函数，并且简化了函数定义**。

还有一种可以包含多条语句，这时候就不能省略`{ ... }`和`return`：

```javascript
x => {
    if (x > 0) {
        return x * x;
    }
    else {
        return - x * x;
    }
}
```

如果参数不是一个，就需要用括号`()`括起来：

```javascript
// 两个参数:
(x, y) => x * x + y * y

// 无参数:
() => 3.14

// 可变参数:
(x, y, ...rest) => {
    let i, sum = x + y;
    for (i=0; i<rest.length; i++) {
        sum += rest[i];
    }
    return sum;
}
```

如果要**返回一个对象**，就要注意，如果是单表达式，这么写的话会报错：

```javascript
// SyntaxError:
x => { foo: x }
```

因为和函数体的`{ ... }`有语法冲突，所以**要改为**：

```javascript
// ok:
x => ({ foo: x })
```

##### **this**

箭头函数看上去是匿名函数的一种简写，但实际上，箭头函数和匿名函数有个明显的区别：箭头函数内部的`this`是词法作用域，由上下文确定。

回顾前面的例子，由于JavaScript函数对`this`绑定的错误处理，下面的例子无法得到预期结果：

```javascript
let obj = {
    birth: 1990,
    getAge: function () {
        let b = this.birth; // 1990
        let fn = function () {
            return new Date().getFullYear() - this.birth; // this指向window或undefined     要改成let that = this;
        };
        return fn();
    }
};
```

现在，箭头函数完全修复了`this`的指向，`this`总是指向词法作用域，也就是外层调用者`obj`：

```javascript
let obj = {
    birth: 1990,
    getAge: function () {
        let b = this.birth; // 1990
        let fn = () => new Date().getFullYear() - this.birth; // this指向obj对象
        return fn();
    }
};
obj.getAge(); // 25
```

## 3.**标准对象**

在JavaScript的世界里，一切都是对象。

用`typeof`操作符获取对象的类型，它总是返回一个字符串：

```javascript
typeof 123; // 'number'
typeof 123n; // 'bigint'
typeof NaN; // 'number'
typeof 'str'; // 'string'
typeof true; // 'boolean'
typeof undefined; // 'undefined'
typeof Math.abs; // 'function'
typeof null; // 'object'
typeof []; // 'object'
typeof {}; // 'object'

```

### **包装对象**

除了这些类型外，JavaScript还提供了包装对象，熟悉Java的小伙伴肯定很清楚`int`和`Integer`这种暧昧关系。

`number`、`boolean`和`string`都有包装对象。没错，在JavaScript中，字符串也区分`string`类型和它的包装类型。包装对象用`new`创建：

```javascript
let n = new Number(123); // 123,生成了新的包装类型
let b = new Boolean(true); // true,生成了新的包装类型
let s = new String('str'); // 'str',生成了新的包装类型
```

虽然包装对象看上去和原来的值一模一样，显示出来也是一模一样，但他们的类型已经变为`object`了！所以，**包装对象和原始值用`===`比较会返回`false`**：

```javascript
typeof new Number(123); // 'object'
new Number(123) === 123; // false

typeof new Boolean(true); // 'object'
new Boolean(true) === true; // false

typeof new String('str'); // 'object'
new String('str') === 'str'; // false
```

有这么几条规则需要遵守：

- 不要使用`new Number()`、`new Boolean()`、`new String()`创建包装对象；
- 用`parseInt()`或`parseFloat()`来转换任意类型到`number`；
- 用`String()`来转换任意类型到`string`，或者直接调用某个对象的`toString()`方法；
- 通常不必把任意类型转换为`boolean`再判断，因为可以直接写`if (myVar) {...}`；
- `typeof`操作符可以判断出`number`、`boolean`、`string`、`function`和`undefined`；
- 判断`Array`要使用`Array.isArray(arr)`；
- 判断`null`请使用`myVar === null`；
- 判断某个全局变量是否存在用`typeof window.myVar === 'undefined'`；
- 函数内部判断某个变量是否存在用`typeof myVar === 'undefined'`。

### 3.1 **Date**

```javascript
let now = new Date();
now; // Wed Jun 24 2015 19:49:22 GMT+0800 (CST)
now.getFullYear(); // 2015, 年份
now.getMonth(); // 5, 月份，注意月份范围是0~11，5表示六月
now.getDate(); // 24, 表示24号
now.getDay(); // 3, 表示星期三
now.getHours(); // 19, 24小时制
now.getMinutes(); // 49, 分钟
now.getSeconds(); // 22, 秒
now.getMilliseconds(); // 875, 毫秒数
now.getTime(); // 1435146562875, 以number形式表示的时间戳
```

当前时间是浏览器从本机操作系统获取的时间，所以不一定准确，因为用户可以把当前时间设定为任何值, 如果要创建一个指定日期和时间的`Date`对象，可以用：

```javascript
let d = new Date(2015, 5, 19, 20, 15, 30, 123);
console.log(d); // Fri Jun 19 2015 20:15:30 GMT+0800 (CST)
```

<aside class="article-note" markdown="1">
💡

JavaScript的Date对象月份值**从0开始**，牢记0=1月，1=2月，2=3月，……，11=12月。

</aside>

第二种创建一个指定日期和时间的方法是解析一个符合[ISO 8601](https://www.w3.org/TR/NOTE-datetime)格式的字符串：

```javascript
let d = Date.parse('2015-06-24T19:49:22.875+08:00');
console.log(d); // 1435146562875
```

但它返回的不是`Date`对象，而是一个时间戳。不过有时间戳就可以很容易地把它转换为一个`Date`：

```javascript
let d = new Date(1435146562875);
d; // Wed Jun 24 2015 19:49:22 GMT+0800 (CST)
d.getMonth(); // 5
```

<aside class="article-note" markdown="1">
💡

使用**Date.parse()时传入的字符串使用实际月份01~12**，转换为Date对象后getMonth()获取的月份值为0~11。

</aside>

##### **时区**

```javascript
let d = new Date(1435146562875);
d.toLocaleString(); // '2015/6/24 下午7:49:22'，本地时间（北京时区+8:00），显示的字符串与操作系统设定的格式有关
d.toUTCString(); // 'Wed, 24 Jun 2015 11:49:22 GMT'，UTC时间，与本地时间相差8小时
```

### **3.2RegExp**

JavaScript有两种方式创建一个正则表达式：

第一种方式是直接通过`/正则表达式/`写出来，第二种方式是通过`new RegExp('正则表达式')`创建一个RegExp对象。

两种写法是一样的：

```javascript
let re1 = /ABC\-001/;
let re2 = new RegExp('ABC\\-001');

re1; // /ABC\-001/
re2; // /ABC\-001/
```

注意，如果使用第二种写法，因为字符串的转义问题，字符串的两个`\\`实际上是一个`\`。

先看看如何判断正则表达式是否匹配：

```javascript
let re = /^\d{3}\-\d{3,8}$/;
re.test('010-12345'); // true
re.test('010-1234x'); // false
re.test('010 12345'); // false
```

RegExp对象的`test()`方法用于测试给定的字符串是否符合条件。

### 3.3 **JSON**

JSON中，一共就这么几种数据类型：

- number：和JavaScript的`number`完全一致；
- boolean：就是JavaScript的`true`或`false`；
- string：就是JavaScript的`string`；
- null：就是JavaScript的`null`；
- array：就是JavaScript的`Array`表示方式——`[]`；
- object：就是JavaScript的`{ ... }`表示方式。

以及上面的任意组合。

并且，JSON还定死了字符集必须是UTF-8，表示多语言就没有问题了。为了统一解析，JSON的字符串规定必须用双引号`""`，Object的键也必须用双引号`""`。

如果收到一个JSON格式的字符串，只需要把**它反序列化成一个JavaScript对象**，就可以在JavaScript中直接使用这个对象了。

#### 序列化

```javascript
let xiaoming = {
    name: '小明',
    age: 14,
    gender: true,
    height: 1.65,
    grade: null,
    'middle-school': '\"W3C\" Middle School',
    skills: ['JavaScript', 'Java', 'Python', 'Lisp']
};

let s = JSON.stringify(xiaoming, null, ' ');
// null 用于筛选对象的键值
console.log(s);
```

##### 在第二个位置传入函数,用于对对象的键值对处理

```javascript
function convert(key, value) {
    if (typeof value === 'string') {
        return value.toUpperCase();
    }
    return value;
}

JSON.stringify(xiaoming, convert, '  ');
```

如果还想要精确控制如何序列化小明，可以给`xiaoming`定义一个**`toJSON()`的方法，直接返回JSON应该序列化的数据**：

```javascript
let xiaoming = {
    name: '小明',
    age: 14,
    gender: true,
    height: 1.65,
    grade: null,
    'middle-school': '\"W3C\" Middle School',
    skills: ['JavaScript', 'Java', 'Python', 'Lisp'],
    toJSON: function () {
        return { // 只输出name和age，并且改变了key：
            'Name': this.name,
            'Age': this.age
        };
    }
};

JSON.stringify(xiaoming); // '{"Name":"小明","Age":14}'
```

#### 反序列化

拿到一个JSON格式的字符串，直接用`JSON.parse()`把它变成一个**JavaScript对象：**

```javascript
JSON.parse('[1,2,3,true]'); // [1, 2, 3, true]
JSON.parse('{"name":"小明","age":14}'); // Object {name: '小明', age: 14}
JSON.parse('true'); // true
JSON.parse('123.45'); // 123.45
```

## 4. 面向对象

JavaScript不区分类和实例的概念，而是通过**原型（prototype）**来实现面向对象编程。

```javascript
let Student = {
    name: 'Robot',
    height: 1.2,
    run: function () {
        console.log(this.name + ' is running...');
    }
};

let xiaoming = {
    name: '小明'
};

xiaoming.__proto__ = Student;
```

![xiaoming 对象通过 prototype 指针关联到 Student 原型对象]({{ site.baseurl }}/img/in-post/2026-10-19-javascript/prototype.png){: width="447" height="192" loading="lazy" decoding="async" }

JavaScript的原型链和Java的Class区别就在，它没有“Class”的概念，所有**对象都是实例**，所谓**继承关系不过是把一个对象的原型指向另一个对象而已。**

在JavaScrip代码运行时期，你可以把`xiaoming`从`Student`变成`Bird`，或者变成任何对象。

***请注意***，上述代码仅用于演示目的。**在编写JavaScript代码时，不要直接用`obj.__proto__`去改变一个对象的原型**，并且低版本的IE也无法使用`__proto__`。

`Object.create()`方法可以传入一个原型对象，并创建一个基于该原型的新对象，但是新对象什么属性都没有，因此，我们可以编写一个函数来创建`xiaoming`：

```javascript
// 原型对象:
let Student = {
    name: 'Robot',
    height: 1.2,
    run: function () {
        console.log(this.name + ' is running...');
    }
};

function createStudent(name) {
    // 基于Student原型创建一个新对象:
    let s = Object.create(Student);
    // 初始化新对象:
    s.name = name;
    return s;
}

let xiaoming = createStudent('小明');
xiaoming.run(); // 小明 is running...
xiaoming.__proto__ === Student; // true
```

### 4.1 创建对象

当我们用`obj.xxx`访问一个对象的属性时，JavaScript引擎先在当前对象上查找该属性，如果没有找到，就到其原型对象上找，如果还没有找到，就一直上溯到`Object.prototype`对象，最后，如果还没有找到，就只能返回`undefined`。

创建一个`Array`对象：

```javascript
let arr = [1, 2, 3];
```

其原型链是：

```
       null
         ▲
         │
┌─────────────────┐
│Object.prototype │
└─────────────────┘
         ▲
         │
┌─────────────────┐
│ Array.prototype │
└─────────────────┘
         ▲
         │
┌─────────────────┐
│       arr       │
└─────────────────┘
```

当创建一个函数时：

```javascript
function foo() {
    return 0;
}
```

函数也是一个对象，它的原型链是：

```
        null
          ▲
          │
┌───────────────────┐
│ Object.prototype  │
└───────────────────┘
          ▲
          │
┌───────────────────┐
│Function.prototype │
└───────────────────┘
          ▲
          │
┌───────────────────┐
│        foo        │
└───────────────────┘
```

#### 构造函数

除了直接用`{ ... }`创建一个对象外，JavaScript还可以用一种构造函数的方法来创建对象。

先定义一个构造函数：

```javascript
function Student(name) {
    this.name = name;
    this.hello = function () {
        alert('Hello, ' + this.name + '!');
    }
}
```

在JavaScript中，可以用关键字`new`来调用这个函数，并返回一个对象：

```javascript
let xiaoming = new Student('小明');
xiaoming.name; // '小明'
xiaoming.hello(); // Hello, 小明!
```

如果又创建了`xiaohong`、`xiaojun`，对象的原型与`xiaoming`是一样的：

```
              null
                ▲
                │
       ┌─────────────────┐
       │Object.prototype │
       └─────────────────┘
                ▲
                │
       ┌─────────────────┐
       │Student.prototype│
       └─────────────────┘
         ▲      ▲      ▲
         │      │      │
┌─────────┐┌─────────┐┌─────────┐
│xiaoming ││xiaohong ││ xiaojun │
└─────────┘└─────────┘└─────────┘
```

用`new Student()`创建的对象还从原型上**获得了一个`constructor`属性，它指向函数`Student`本身：**

```javascript
xiaoming.constructor === Student.prototype.constructor; // true
Student.prototype.constructor === Student; // true

Object.getPrototypeOf(xiaoming) === Student.prototype; // true

xiaoming instanceof Student; // true
```

![对象实例、构造函数、原型对象与 Object.prototype 之间的原型链关系]({{ site.baseurl }}/img/in-post/2026-10-19-javascript/prototype-chain.png){: width="656" height="274" loading="lazy" decoding="async" }

### 4.2 原型继承

JavaScript 根本没有“类”的概念，只有对象。所谓原型链，就是**对象找属性时，自己身上没有，就顺着一条内置指针去绑定的上层对象里找，直到找到或者撞到 `null` 为止**。

### 4.3 class继承

用新的`class`关键字来编写`Student`，可以这样写：

```javascript
class Student {
    constructor(name) {
        this.name = name;
    }

    hello() {
        alert('Hello, ' + this.name + '!');
    }
}
```

最后，创建一个`Student`对象代码和前面章节完全一样：

```javascript
let xiaoming = new Student('小明');
xiaoming.hello();
```

#### class继承

通过`extends`来实现：

```javascript
class PrimaryStudent extends Student {
    constructor(name, grade) {
        super(name); // 记得用super调用父类的构造方法!
        this.grade = grade;
    }

    myGrade() {
        alert('I am at grade ' + this.grade);
    }
}
```

子类的构造函数可能会与父类不太相同，例如，`PrimaryStudent`需要`name`和`grade`两个参数，并且需要通过`super(name)`来调用父类的构造函数，否则父类的`name`属性无法正常初始化。

## 5. 浏览器

### 5.1 浏览器对象

#### **navigator**

`navigator`对象表示浏览器的信息，最常用的属性包括：

- navigator.appName：浏览器名称；
- navigator.appVersion：浏览器版本；
- navigator.language：浏览器设置的语言；
- navigator.platform：操作系统类型；
- navigator.userAgent：浏览器设定的`User-Agent`字符串。

#### **location**

`location`对象表示当前页面的URL信息。例如，一个完整的URL：

```
http://www.example.com:8080/path/index.html?a=1&b=2#TOP
```

可以用`location.href`获取。要获得URL各个部分的值，可以这么写：

```javascript
location.protocol; // 'http'
location.host; // 'www.example.com'
location.port; // '8080'
location.pathname; // '/path/index.html'
location.search; // '?a=1&b=2'
location.hash; // 'TOP'
```

要加载一个新页面，可以调用`location.assign()`。如果要重新加载当前页面，调用`location.reload()`方法非常方便。

#### **document**

`document`对象表示当前页面。由于HTML在浏览器中以DOM形式表示为树形结构，`document`对象就是整个DOM树的根节点。

`document`的`title`属性是从HTML文档中的`<title>xxx</title>`读取的

要查找DOM树的某个节点，需要从`document`对象开始查找。最常用的查找是根据ID和Tag Name。

我们先准备HTML数据：

```html
<dl id="drink-menu" style="border:solid 1px #ccc;padding:6px;">
    <dt>摩卡</dt>
    <dd>热摩卡咖啡</dd>
    <dt>酸奶</dt>
    <dd>北京老酸奶</dd>
    <dt>果汁</dt>
    <dd>鲜榨苹果汁</dd>
</dl>
```

摩卡热摩卡咖啡酸奶北京老酸奶果汁鲜榨苹果汁

用`document`对象提供的`getElementById()`和`getElementsByTagName()`可以按ID获得一个DOM节点和按Tag名称获得一组DOM节点：

```javascript
let menu = document.getElementById('drink-menu');
let drinks = document.getElementsByTagName('dt');
let s = '提供的饮料有:';

for (let i=0; i<drinks.length; i++) {
    s = s + drinks[i].innerHTML + ',';
}
console.log(s);
```

#### Cookie

HTTP协议是**无状态**的，但是服务器要区分到底是哪个用户发过来的请求，就可以用Cookie来区分。当一个用户成功登录后，服务器发送一个Cookie给浏览器，例如`user=ABC123XYZ(加密的字符串)...`，此后，浏览器访问该网站时，会在请求头附上这个Cookie，服务器根据Cookie即可区分出用户。

JavaScript可以通过`document.cookie`读取到当前页面的Cookie：

```javascript
document.cookie; // 'v=123; remember=true; prefer=zh'
```

由于JavaScript能读取到页面的Cookie，而用户的登录信息通常也存在Cookie中，这就造成了巨大的安全隐患，这是因为在HTML页面中引入第三方的JavaScript代码是允许的：

```html
<!-- 当前页面在www.example.com -->
<html>
    <head>
        <script src="http://www.foo.com/jquery.js"></script>
    </head>
    ...
</html>
```

如果引入的第三方的JavaScript中存在恶意代码，则`www.foo.com`网站将直接获取到`www.example.com`网站的用户登录信息。

为了解决这个问题，服务器在设置Cookie时可以使用`httpOnly`，设定了`httpOnly`的Cookie将不能被JavaScript读取。

#### **history**

`history`对象保存了浏览器的历史记录，JavaScript可以调用`history`对象的`back()`或`forward ()`，相当于用户点击了浏览器的“后退”或“前进”按钮。

这个对象属于历史遗留对象，对于现代Web页面来说，**由于大量使用AJAX和页面交互**，简单粗暴地调用`history.back()`可能会让用户感到非常愤怒。

对使用AJAX动态加载的页面，如果希望页面更新时同时更新`history`对象，应当使用`history.pushState()`方法：

```javascript
// when AJAX is done:
let state = 'any-data';
let newUrl = '/ajax.html#signin';
history.pushState(state, '', newUrl);
```

当用户点击**“后退”**时，浏览器**并不会刷新页面**，而是**触发`popstate`事件**，可由JavaScript捕获并更新相应的部分页面内容.

### 5.2 操作 DOM

始终记住DOM是一个树形结构。操作一个DOM节点实际上就是这么几个操作：

- 更新：更新该DOM节点的内容，相当于更新了该DOM节点表示的HTML的内容；
- 遍历：遍历该DOM节点下的子节点，以便进行进一步操作；
- 添加：在该DOM节点下新增一个子节点，相当于动态增加了一个HTML节点；
- 删除：将该节点从HTML中删除，相当于删掉了该DOM节点的内容以及它包含的所有子节点。

#### 更新DOM

可以直接修改节点的文本，方法有两种：

一种是修改`innerHTML`属性，这个方式非常强大，不但可以修改一个DOM节点的文本内容，还可以直接通过HTML片段修改DOM节点内部的子树：

```javascript
// 获取<p id="p-id">...</p>
let p = document.getElementById('p-id');
// 设置文本为abc:
p.innerHTML = 'ABC'; // <p id="p-id">ABC</p>
// 设置HTML:
p.innerHTML = 'ABC <span style="color:red">RED</span> XYZ';
// <p>...</p>的内部结构已修改
```

用`innerHTML`时要注意，是否需要写入HTML。如果写入的字符串是通过网络拿到的，要注意对字符编码来避免XSS攻击。

第二种是修改**`innerText`**或`textContent`属性，这样可以自动对字符串进行HTML编码，保证无法设置任何HTML标签：

```javascript
// 获取<p id="p-id">...</p>
let p = document.getElementById('p-id');
// 设置文本:
p.innerText = '<script>alert("Hi")</script>';
// HTML被自动编码，无法设置一个<script>节点:
// <p id="p-id">&lt;script&gt;alert("Hi")&lt;/script&gt;</p>
```

两者的区别在于读取属性时，`innerText`不返回隐藏元素的文本，而`textContent`返回所有文本。

修改CSS也是经常需要的操作。**DOM节点的`style`属性对应所有的CSS，可以直接获取或设置。**因为CSS允许`font-size`这样的名称，但它并非JavaScript有效的属性名，所以需要在JavaScript中改写为驼峰式命名`fontSize`：

```javascript
// 获取<p id="p-id">...</p>
let p = document.getElementById('p-id');
// 设置CSS:
p.style.color = '#ff0000';
p.style.fontSize = '20px';
p.style.paddingTop = '2em';
```

#### **插入DOM**

如果这个DOM节点是空的，例如，`<div></div>`，那么，直接使用`innerHTML = '<span>child</span>'`就可以修改DOM节点的内容，相当于“插入”了新的DOM节点。

插入方式:
使用`appendChild`，把一个子节点添加到父节点的最后一个子节点。例如：

```html
<!-- HTML结构 -->
<p id="js">JavaScript</p>
<div id="list">
    <p id="java">Java</p>
    <p id="python">Python</p>
    <p id="scheme">Scheme</p>
</div>
```

把`<p id="js">JavaScript</p>`添加到`<div id="list">`的最后一项：

```javascript
let
    js = document.getElementById('js'),
    list = document.getElementById('list');
list.appendChild(js);

```

现在，HTML结构变成了这样：

```html
<!-- HTML结构 -->
<div id="list">
    <p id="java">Java</p>
    <p id="python">Python</p>
    <p id="scheme">Scheme</p>
    <p id="js">JavaScript</p>
</div>
```

因为我们插入的`js`节点已经存在于当前的文档树，因此这个**节点首先会从原先的位置删除**，**再插入到新的位置。**

#### 删除DOM

删除一个节点，首先获得该节点本身以及它的父节点，调用父节点的`removeChild`把自己删掉：

```javascript
// 拿到待删除节点:
let self = document.getElementById('to-be-removed');
// 拿到父节点:
let parent = self.parentElement;
// 删除:
let removed = parent.removeChild(self);
removed === self; // true
```

注意到删除后的节点虽然不在文档树中了，但**其实它还在内存中**，可以随时再次被添加到别的位置。

### 5.3 操作表单

HTML表单的输入控件主要有以下几种：

- 文本框，对应的`<input type="text">`，用于输入文本；
- 口令框，对应的`<input type="password">`，用于输入口令；
- 单选框，对应的`<input type="radio">`，用于选择一项；
- 复选框，对应的`<input type="checkbox">`，用于选择多项；
- 下拉框，对应的`<select>`，用于选择一项；
- 隐藏文本，对应的`<input type="hidden">`，用户不可见，但表单提交时会把隐藏文本发送到服务器。

#### **获取值**

如果获得了一个`<input>`节点的引用，就可以直接调用`value`获得对应的用户输入值：

```javascript
// <input type="text" id="email">
let input = document.getElementById('email');
input.value; // '用户输入的值'
```

这种方式可以应用于`text`、`password`、`hidden`以及`select`。但是，对于单选框和复选框，`value`属性返回的永远是HTML预设的值，而我们需要获得的实际是用户是否“勾上了”选项，所以应该用`checked`判断：

```javascript
// <label><input type="radio" name="weekday" id="monday" value="1"> Monday</label>
// <label><input type="radio" name="weekday" id="tuesday" value="2"> Tuesday</label>
let mon = document.getElementById('monday');
let tue = document.getElementById('tuesday');
mon.value; // '1'
tue.value; // '2'
mon.checked; // true或者false
tue.checked; // true或者false
```

#### **设置值**

设置值和获取值类似，对于`text`、`password`、`hidden`以及`select`，直接设置`value`就可以：

```javascript
// <input type="text" id="email">
let input = document.getElementById('email');
input.value = 'test@example.com'; // 文本框的内容已更新
```

对于单选框和复选框，设置`checked`为`true`或`false`即可。

#### **提交表单**

JavaScript可以以两种方式来处理表单的提交（AJAX方式在后面章节介绍）。

方式一是通过`<form>`元素的`submit()`方法提交一个表单，例如，响应一个`<button>`的`click`事件，在JavaScript代码中提交表单：

```html
<!-- HTML -->
<form id="test-form">
    <input type="text" name="test">
    <button type="button" onclick="doSubmitForm()">Submit</button>
</form>

<script>
function doSubmitForm() {
    let form = document.getElementById('test-form');
    // 可以在此修改form的input...
    // 提交form:
    form.submit();
}</script>
```

第二种方式是响应`<form>`本身的`onsubmit`事件，在提交form时作修改：

```html
<!-- HTML -->
<form id="test-form" onsubmit="return checkForm()">
    <input type="text" name="test">
    <button type="submit">Submit</button>
</form>

<script>
function checkForm() {
    let form = document.getElementById('test-form');
    // 可以在此修改form的input...
    // 继续下一步:
    return true;
}</script>
```

要`return true`来告诉浏览器继续提交，如果`return false`，浏览器将不会继续提交form，这种情况通常对应用户输入有误，提示用户错误信息后终止提交form。

在检查和修改`<input>`时，要充分利用`<input type="hidden">`来传递数据。

### 5.4 操作文件

上传文件的唯一控件就是`<input type="file">`

<aside class="article-note" markdown="1">
💡

***注意***：当一个表单包含`<input type="file">`时，表单的`enctype`必须指定为`multipart/form-data`，`method`必须指定为`post`，浏览器才能正确编码并以`multipart/form-data`格式发送表单的数据。

</aside>

出于安全考虑，浏览器只允许用户点击`<input type="file">`来选择本地文件，用JavaScript对`<input type="file">`的`value`赋值是没有任何效果的, 当用户选择了上传某个文件后，JavaScript也无法获得该文件的真实路径.

### 5.5 AJAX—Asynchronous JavaScript and XML

**ajax将请求发出去之后，代码就继续往下执行了，等到ajax收到响应结果了，再回头执行ajax的回调函数，这才是异步。**

如果仔细观察一个Form的提交，你就会发现，**一旦用户点击“Submit”按钮，表单开始提交，浏览器就会刷新页面**，然后在新页面里告诉你操作是成功了还是失败了。如果不幸由于网络太慢或者其他原因，就会得到一个404页面。

这就是**Web的运作原理：一次HTTP请求对应一个页面**。

如果要让用户留在当前页面中，同时发出新的HTTP请求，就必须**用JavaScript发送这个新请求**，接收到数据后，再用JavaScript更新页面，这样一来，用户就感觉自己仍然停留在当前页面，但是***数据却可以不断地更新***。

#### 安全限制

默认情况下，JavaScript在发送AJAX请求时，URL的域名必须和当前页面完全一致。

完全一致的意思是，域名要相同（`www.example.com`和`example.com`不同），协议要相同（`http`和`https`不同），端口号要相同（http默认是`:80`端口，它和`:8080`就不同）。有的浏览器口子松一点，允许端口不同，大多数浏览器都会严格遵守这个限制。

#### **CORS—**Cross-Origin Resource Sharing

如果浏览器支持HTML5，那么就可以一劳永逸地使用新的跨域策略：CORS了, 是HTML5规范定义的如何跨域访问资源。

Origin表示本域，也就是浏览器当前页面的域。当JavaScript向外域（如sina.com）发起请求后，浏览器收到响应后，首先检查`Access-Control-Allow-Origin`是否包含本域，如果是则此次跨域请求成功，如果不是则请求失败，**JavaScript将无法获取到响应的任何数据**。

用一个图来表示就是：

```
         GET /res/abc.data
         Host: sina.com
┌──────┐ Origin: http://my.com                      ┌────────┐
│my.com│───────────────────────────────────────────▶│sina.com│
│      │◀───────────────────────────────────────────│        │
└──────┘ HTTP/1.1 200 OK                            └────────┘
         Access-Control-Allow-Origin: http://my.com
         Content-Type: text/xml

         <xml data...>
```

假设本域是`my.com`，外域是`sina.com`，只要响应头`Access-Control-Allow-Origin`为`http://my.com`，或者是`*`，本次请求就可以成功。

可见，跨域能否成功，取决于对方服务器是否愿意给你设置一个正确的`Access-Control-Allow-Origin`，决定权始终在对方手中, 上面这种跨域请求，称之为“简单请求”。简单请求包括GET、HEAD和POST（POST的Content-Type类型 仅限`application/x-www-form-urlencoded`、`multipart/form-data`和`text/plain`），并且不能出现任何自定义头（例如，`X-Custom: 12345`），通常能满足90%的需求。

对于PUT、DELETE以及其他类型如`application/json`的POST请求，在发送AJAX请求之前，浏览器会先发送一个`OPTIONS`请求（称为preflighted请求）到这个URL上，询问目标服务器是否接受：

```
OPTIONS /path/to/resource HTTP/1.1
Host: bar.com
Origin: http://my.com
Access-Control-Request-Method: POST
```

服务器必须响应并明确指出允许的Method：

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://my.com
Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS
Access-Control-Max-Age: 86400
```

浏览器确认服务器响应的`Access-Control-Allow-Methods`头确实包含将要发送的AJAX请求的Method，才会继续发送AJAX，否则，抛出一个错误。

由于以`POST`、`PUT`方式传送JSON格式的数据在REST中很常见，所以要跨域正确处理`POST`和`PUT`请求，服务器端必须正确响应`OPTIONS`请求。

### 5.6 **Canvas**

Canvas是HTML5新增的组件，它就像一块幕布，可以用JavaScript在上面绘制各种图表、动画等。

一个Canvas定义了一个指定尺寸的矩形框，在这个范围内可以随意绘制：

```html
<canvas id="test-canvas" width="300" height="200"></canvas>
```

`getContext('2d')`方法可以拿到一个`CanvasRenderingContext2D`对象，所有的绘图操作都需要通过这个对象完成。

```javascript
let ctx = canvas.getContext('2d');
```

如果需要绘制3D？HTML5还有一个WebGL规范，允许在Canvas中绘制3D图形：

```javascript
gl = canvas.getContext("webgl");
```

## 6. 报错处理

#### **try ... catch ... finally**

```javascript
let r1, r2, s = null;
try {
    r1 = s.length; // 此处应产生错误
    r2 = 100; // 该语句不会执行
} catch (e) {
    console.log('出错了：' + e);
} finally {
    console.log('finally');
}
console.log('r1 = ' + r1); // r1应为undefined
console.log('r2 = ' + r2); // r2应为undefined

```

当代码块被`try { ... }`包裹的时候，就表示这部分代码执行过程中可能会发生错误，一旦发生错误，就**不再继续执行后续代码**，转而跳到`catch`块。`catch (e) { ... }`包裹的代码就是错误处理代码，变量`e`表示捕获到的错误。最后无论有没有错误，**`finally`一定会被执行**。

所以，有错误发生时，执行流程像这样：
先执行`try { ... }`的代码；
→执行到出错的语句时，后续语句不再继续执行，→转而执行`catch (e) { ... }`代码；
→最后执行`finally { ... }`代码。

而没有错误发生时，执行流程像这样：
→先执行`try { ... }`的代码；
因为没有出错，`catch (e) { ... }`代码不会被执行；
→最后执行`finally { ... }`代码。

#### **错误类型**

JavaScript有一个标准的`Error`对象表示错误，还有从`Error`派生`TypeError`、`ReferenceError`等错误对象。

在处理错误时，可以通过`catch(e)`捕获的变量`e`访问错误对象：

```javascript
try {
    ...
} catch (e) {
    if (e instanceof TypeError) {
        alert('Type error!');
    } else if (e instanceof Error) {
        alert(e.message);
    } else {
        alert('Error: ' + e);
    }
}
```

使用变量`e`是一个习惯用法，也可以以其他变量名命名，如`catch(ex)`。

#### **抛出错误**

程序也可以主动抛出一个错误，让执行流程直接跳转到`catch`块。抛出错误使用`throw`语句。

例如，下面的代码让用户输入一个数字，程序接收到的实际上是一个字符串，然后用`parseInt()`转换为整数。当用户输入不合法的时候就抛出错误：

```javascript
let r, n, s;
try {
    s = prompt('请输入一个数字');
    n = parseInt(s);
    if (isNaN(n)) {
        throw new Error('输入错误');
    }
    // 计算平方:
    r = n * n;
    console.log(n + ' * ' + n + ' = ' + r);
} catch (e) {
    console.log('出错了：' + e);
}

```

### 6.1 错误传播

如果代码发生了错误，又没有被try ... catch捕获，那么程序执行流程会跳转到哪呢？

```javascript
function getLength(s) {
    return s.length;
}

function printLength() {
    console.log(getLength('abc')); // 3
    console.log(getLength(null)); // Error!
}

printLength();
```

如果在一个函数内部发生了错误，**它自身没有捕获，错误就会被抛到外层调用函数**，如果外层函数也没有捕获，该错误会一直沿着函数调用链向上抛出，**直到被JavaScript引擎捕获，代码终止执行**。

所以**不必在每一个函数内部捕获错误**，只需要在合适的地方来个统一捕获，一网打尽：

```javascript
function main(s) {
    console.log('BEGIN main()');
    try {
        foo(s);
    } catch (e) {
        console.log('出错了：' + e);
    }
    console.log('END main()');
}

function foo(s) {
    console.log('BEGIN foo()');
    bar(s);
    console.log('END foo()');
}

function bar(s) {
    console.log('BEGIN bar()');
    console.log('length = ' + s.length);
    console.log('END bar()');
}

main(null);

```

当`bar()`函数传入参数`null`时，代码会报错，错误会向上抛给调用方`foo()`函数，`foo()`函数没有try ... catch语句，所以**错误继续向上抛给调用方`main()`函数**，`main()`函数有try ... catch语句，所以**错误最终在`main()`函数被处理了**。

### 6.2 **异步错误处理**

JavaScript引擎是一个事件驱动的执行引擎，**代码总是以单线程执行**，而**回调函数的执行需要等到下一个满足条件的事件出现**后，才会被执行。

`setTimeout()`函数可以传入回调函数，并在指定若干毫秒后执行：

```javascript
function printTime() {
    console.log('It is time!');
}

setTimeout(printTime, 1000);
console.log('done');
```

如果`printTime()`函数内部发生了错误，我们试图用try包裹`setTimeout()`是无效的：

```javascript
function printTime() {
    throw new Error();
}

try {
    setTimeout(printTime, 1000);
    console.log('done');
} catch (e) {
    console.log('error');
}

```

<aside class="article-note" markdown="1">
💡

原因就在于调用`setTimeout()`函数时，**传入的`printTime`函数并未立刻执行**！紧接着，JavaScript引擎会继续执行`console.log('done');`语句，而此时并没有错误发生。直到1秒钟后，执行`printTime`函数时才发生错误，但此时除了在`printTime`函数内部捕获错误外，外层代码并无法捕获。

涉及到异步代码，无法在调用时捕获，**原因就是在捕获的当时，回调函数并未执行**。

</aside>

## 7. **jQuery**

- 消除浏览器差异：**你不需要自己写冗长的代码来针对不同的浏览器来绑定事件，编写AJAX等代码；**
- 简洁的操作DOM的方法：写`$('#test')`肯定比`document.getElementById('test')`来得简洁；
- 轻松实现动画、修改CSS等各种操作。

使用jQuery只需要在页面的`<head>`引入jQuery文件即可：

```html
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
	...
</head>
<body>
    ...
</body>
</html>
```

#### **$符号**

`$`是著名的jQuery符号。**实际上，jQuery把所有功能全部封装在一个全局变量`jQuery`中**，而`$`也是一个合法的变量名，**它是变量`jQuery`的别名**：

```javascript
window.jQuery; // jQuery(selector, context)
window.$; // jQuery(selector, context)
$ === jQuery; // true
typeof($); // 'function'
```

`$`本质上就是一个函数，但是函数也是对象，于是`$`除了可以直接调用外，也可以有很多其他属性. ***注意***，你看到的`$`函数名可能不是`jQuery(selector, context)`，因为很多JavaScript压缩工具可以对函数名和参数改名，所以压缩过的jQuery源码`$`函数可能变成`a(b,c)`。

### 7.1 **选择器**

选择器是jQuery的核心。一个选择器写出来类似`$('#dom-id')`回顾一下DOM操作中我们经常使用的代码：

```javascript
// 按ID查找：
let a = document.getElementById('dom-id');

// 按tag查找：
let divs = document.getElementsByTagName('div');

// 查找<p class="red">：
let ps = document.getElementsByTagName('p');
// 过滤出class="red":
// TODO:

// 查找<table class="green">里面的所有<tr>：
let table = ...
for (let i=0; i<table.children; i++) {
    // TODO: 过滤出<tr>
}
```

这些代码实在太繁琐了，并且，在层级关系中，例如，查找`<table class="green">`里面的所有`<tr>`，一层循环实际上是错的，因为`<table>`的标准写法是：

```html
<table>
    <tbody>
        <tr>...</tr>
        <tr>...</tr>
    </tbody>
</table>
```

很多时候，需要递归查找所有子节点, jQuery的选择器就是帮助我们快速定位到一个或多个DOM节点。

#### **按ID查找**

如果某个DOM节点有`id`属性，利用jQuery查找如下：

```javascript
// 查找<div id="abc">:
let div = $('#abc');
```

***注意***，**`#abc`以`#`开头。返回的对象是jQuery对象**。

什么是jQuery对象？jQuery对象类似数组，它的每个元素都是一个引用了DOM节点的对象。

以上面的查找为例，如果`id`为`abc`的`<div>`存在，返回的jQuery对象如下：

```javascript
[<div id="abc">...</div>]
```

如果`id`为`abc`的`<div>`不存在，返回的jQuery对象如下：[]

总之jQuery的选择器不会返回`undefined`或者`null`，这样的好处是你不必在下一行判断`if (div === undefined)`。

jQuery对象和DOM对象之间可以互相转化：

```javascript
let div = $('#abc'); // jQuery对象
let divDom = div.get(0); // 假设存在div，获取第1个DOM元素
let another = $(divDom); // 重新把DOM包装为jQuery对象
```

通常情况下你不需要获取DOM对象，直接使用jQuery对象更加方便。如果你拿到了一个DOM对象，那可以简单地调用`$(aDomObject)`把它变成jQuery对象，这样就可以方便地使用jQuery的API了。

#### **按tag查找**

按tag查找只需要写上tag名称就可以了：

```javascript
let ps = $('p'); // 返回所有<p>节点
ps.length; // 数一数页面有多少个<p>节点
```

#### **按class查找**

按class查找注意在class名称前加一个`.`：

```javascript
let a = $('.red'); // 所有节点包含`class="red"`都将返回
// 例如:
// <div class="red">...</div>
// <p class="green red">...</p>
```

通常很多节点有多个class，我们可以查找同时包含`red`和`green`的节点：

```javascript
let a = $('.red.green'); // 注意没有空格！
// 符合条件的节点：
// <div class="red green">...</div>
// <div class="blue green red">...</div>
```

#### **按属性查找**

一个DOM节点除了`id`和`class`外还可以有很多属性，很多时候按属性查找会非常方便，比如在一个表单中按属性来查找：

```javascript
let email = $('[name=email]'); // 找出<??? name="email">
let passwordInput = $('[type=password]'); // 找出<??? type="password">
let a = $('[items="A B"]'); // 找出<??? items="A B">
```

当属性的值包含空格等特殊字符时，需要用双引号括起来。

按属性查找还可以使用前缀查找或者后缀查找：

```javascript
let icons = $('[name^=icon]'); // 找出所有name属性值以icon开头的DOM
// 例如: name="icon-1", name="icon-2"
let names = $('[name$=with]'); // 找出所有name属性值以with结尾的DOM
// 例如: name="startswith", name="endswith"
```

这个方法尤其适合通过class属性查找，且不受class包含多个名称的影响：

```javascript
let icons = $('[class^="icon-"]'); // 找出所有class包含至少一个以`icon-`开头的DOM
// 例如: class="icon-clock", class="abc icon-home"
```

#### **组合查找**

组合查找就是把上述简单选择器组合起来使用。如果我们查找`$('[name=email]')`，很可能把表单外的`<div name="email">`也找出来，但我们只希望查找`<input>`，就可以这么写：

```javascript
let emailInput = $('input[name=email]'); // 不会找出<div name="email">
```

同样的，根据tag和class来组合查找也很常见：

```javascript
let tr = $('tr.red'); // 找出<tr class="red ...">...</tr>
```

#### **多项选择器**

多项选择器就是把多个选择器用`,`组合起来一块选：

```javascript
$('p,div'); // 把<p>和<div>都选出来
$('p.red,p.green'); // 把<p class="red">和<p class="green">都选出来
```

要注意的是，选出来的元素是按照它们在HTML中出现的顺序排列的，而且不会有重复元素。例如，`<p class="red green">`不会被上面的`$('p.red,p.green')`选择两次。

#### 7.1.1 **层级选择器（Descendant Selector）**

如果两个DOM元素具有层级关系，就可以用`$('ancestor descendant')`来选择，层级之间用空格隔开, 例如：

```html
<!-- HTML结构 -->
<div class="testing">
    <ul class="lang">
        <li class="lang-javascript">JavaScript</li>
        <li class="lang-python">Python</li>
        <li class="lang-lua">Lua</li>
    </ul>
</div>
```

要选出JavaScript，可以用层级选择器：

```javascript
$('ul.lang li.lang-javascript'); // [<li class="lang-javascript">JavaScript</li>]
$('div.testing li.lang-javascript'); // [<li class="lang-javascript">JavaScript</li>]
```

因为`<div>`和`<ul>`都是`<li>`的祖先节点，所以上面两种方式都可以选出相应的`<li>`节点。要选择所有的`<li>`节点，用：

```javascript
$('ul.lang li');
```

这种层级选择器相比单个的选择器好处在于，它缩小了选择范围，因为首先要定位父节点，才能选择相应的子节点，这样避免了页面其他不相关的元素。

例如：

```javascript
$('form[name=upload] input');
```

就把选择范围限定在`name`属性为`upload`的表单里。如果页面有很多表单，其他表单的`<input>`不会被选择, 多层选择也是允许的：

```javascript
$('form.test p input'); // 在form表单选择被<p>包含的<input>
```

#### **子选择器（Child Selector）**

子选择器`$('parent>child')`类似层级选择器，但是限定了层级关系必须是父子关系，就是`<child>`节点必须是`<parent>`节点的直属子节点。还是以上面的例子：

```javascript
$('ul.lang>li.lang-javascript'); // 可以选出[<li class="lang-javascript">JavaScript</li>]
$('div.testing>li.lang-javascript'); // [], 无法选出，因为<div>和<li>不构成父子关系
```

#### **过滤器（Filter）**

过滤器一般不单独使用，它通常附加在选择器上，帮助我们更精确地定位元素。观察过滤器的效果：

```javascript
$('ul.lang li'); // 选出JavaScript、Python和Lua 3个节点
$('ul.lang li:first-child'); // 仅选出JavaScript
$('ul.lang li:last-child'); // 仅选出Lua
$('ul.lang li:nth-child(2)'); // 选出第N个元素，N从1开始
$('ul.lang li:nth-child(even)'); // 选出序号为偶数的元素
$('ul.lang li:nth-child(odd)'); // 选出序号为奇数的元素
```

#### **表单相关**

针对表单元素，jQuery还有一组特殊的选择器：

- `:input`：可以选择`<input>`，`<textarea>`，`<select>`和`<button>`；
- `:file`：可以选择`<input type="file">`，和`input[type=file]`一样；
- `:checkbox`：可以选择复选框，和`input[type=checkbox]`一样；
- `:radio`：可以选择单选框，和`input[type=radio]`一样；
- `:focus`：可以选择当前输入焦点的元素，例如把光标放到一个`<input>`上，用`$('input:focus')`就可以选出；
- `:checked`：选择当前勾上的单选框和复选框，用这个选择器可以立刻获得用户选择的项目，如`$('input[type=radio]:checked')`；
- `:enabled`：可以选择可以正常输入的`<input>`、`<select>` 等，也就是没有灰掉的输入；
- `:disabled`：和`:enabled`正好相反，选择那些不能输入的。

此外，jQuery还有很多有用的选择器，例如，选出可见的或隐藏的元素：

```javascript
$('div:visible'); // 所有可见的div
$('div:hidden'); // 所有隐藏的div
```

### 7.2 **操作DOM**

回顾一下修改DOM的CSS、文本、设置HTML有多么麻烦，而且有的浏览器只有innerHTML，有的浏览器支持innerText，**有了jQuery对象，不需要考虑浏览器差异了**，全部统一操作！

#### **修改Text和HTML**

jQuery对象的`text()`和`html()`方法分别获取节点的文本和原始HTML文本，例如如下的HTML结构：

```html
<!-- HTML结构 -->
<ul id="test-ul">
    <li class="js">JavaScript</li>
    <li name="book">Java &amp; JavaScript</li>
</ul>
```

分别获取文本和HTML：

```javascript
$('#test-ul li[name=book]').text(); // 'Java & JavaScript'
$('#test-ul li[name=book]').html(); // 'Java &amp; JavaScript'
```

如何设置文本或HTML？jQuery的API设计非常巧妙：无参数调用`text()`是获取文本，传入参数就变成设置文本，HTML也是类似操作，自己动手试试：

#### **修改CSS**

jQuery对象有“批量操作”的特点，这用于修改CSS实在是太方便了。考虑下面的HTML结构：

```html
<!-- HTML结构 -->
<ul id="test-css">
    <li class="lang dy"><span>JavaScript</span></li>
    <li class="lang"><span>Java</span></li>
    <li class="lang dy"><span>Python</span></li>
    <li class="lang"><span>Swift</span></li>
    <li class="lang dy"><span>Scheme</span></li>
</ul>
```

```javascript
$('#test-css li.dy>span').css('background-color', '#ff0').css('color', '#c00');
```

#### 7.2.1 **修改DOM结构**

#### **添加DOM**

要添加新的DOM节点，除了通过jQuery的`html()`这种暴力方法外，还可以用`append()`方法，例如：

```html
<div id="test-div">
    <ul>
        <li><span>JavaScript</span></li>
        <li><span>Python</span></li>
        <li><span>Swift</span></li>
    </ul>
</div>
```

如何向列表新增一个语言？首先要拿到`<ul>`节点：

```javascript
let ul = $('#test-div>ul');
```

然后，调用`append()`传入HTML片段：

```javascript
ul.append('<li><span>Haskell</span></li>');
```

除了接受字符串，`append()`还可以传入原始的DOM对象，jQuery对象和函数对象：

```javascript
// 创建DOM对象:
let ps = document.createElement('li');
ps.innerHTML = '<span>Pascal</span>';
// 添加DOM对象:
ul.append(ps);

// 添加jQuery对象:
ul.append($('#scheme'));

// 添加函数对象:
ul.append(function (index, html) {
    return '<li><span>Language - ' + index + '</span></li>';
});
```

传入函数时，要求返回一个字符串、DOM对象或者jQuery对象。因为jQuery的`append()`可能作用于一组DOM节点，只有传入函数才能针对每个DOM生成不同的子节点。

`append()`把DOM添加到最后，`prepend()`则把DOM添加到最前。

另外注意，如果要添加的DOM节点已经存在于HTML文档中，它会**首先从文档移除，然后再添加**。

#### **删除节点**

要删除DOM节点，拿到jQuery对象后直接调用`remove()`方法就可以了。如果jQuery对象包含若干DOM节点，实际上可以一次删除多个DOM节点：

```javascript
let li = $('#test-div>ul>li');
li.remove(); // 所有<li>全被删除
```

## 8. **Node.js**

### **8.1 npm**

npm其实是Node.js的包管理工具（package manager）。如果要使用模块A，而模块A又依赖于模块B，模块B又依赖于模块X和模块Y，npm可以根据依赖关系把所有依赖的包都下载下来并管理起来。

### 8.2 使用模块

把`hello.js`改造一下，创建一个函数，这样我们就可以在其他地方调用这个函数：

```javascript
'use strict';

const s = 'Hello';

function greet(name) {
    console.log(s + ', ' + name + '!');
}

module.exports = greet;
```

函数`greet()`是我们在`hello`模块中定义的，把函数`greet`作为模块的输出暴露出去，这样其他模块就可以使用`greet`函数了。

再编写一个`main.js`文件，调用`hello`模块的`greet`函数：

```javascript
'use strict';

// 引入hello模块:
const greet = require('./hello');

let s = 'Michael';

greet(s); // Hello, Michael!
```

注意到引入`hello`模块用Node提供的`require`函数：

```javascript
const greet = require('./hello');
```

引入的模块作为变量保存在`greet`变量中，那`greet`变量到底是什么东西？其实变量`greet`就是在`hello.js`中我们用`module.exports = greet;`输出的`greet`函数。

#### **CommonJS规范**

这种模块加载机制被称为CommonJS规范。在这个规范下，每个`.js`文件都是一个模块，它们内部各自使用的变量名和函数名都互不冲突，例如，`hello.js`和`main.js`都申明了全局变量`var s = 'xxx'`，但互不影响。

一个模块想要对外暴露变量（函数也是变量），**可以用`module.exports = variable;`**，一个模块要引用其他模块暴露的变量，用**`var ref = require('module_name');`**就拿到了引用模块的变量。

#### **结论**

要在模块中对外输出变量，用：

```javascript
module.exports = variable;
```

输出的变量可以是任意对象、函数、数组等等。要引入其他模块输出的对象，用：

```javascript
const foo = require('other_module');
```
