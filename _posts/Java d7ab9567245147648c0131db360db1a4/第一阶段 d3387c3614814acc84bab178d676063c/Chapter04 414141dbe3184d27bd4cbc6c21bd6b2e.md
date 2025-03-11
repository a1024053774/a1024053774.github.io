# Chapter04

控制结构

## 顺序控制

从上到下逐行执行，无跳转和判断

先定义再使用

## 分支控制(if else switch)

### if-else

### 单分支

if(条件表达式){

执行代码块

}

当条件表达式为真，执行{}里的代码，如果为false，不执行。（如果{}只有一条语句，{}可以省略）

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled.png)

### 双分支

if ( ) {

} else {

}

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%201.png)

### 练习

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%202.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%203.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%204.png)

### 多分支

if () {

} else if () {

} 

……

else{

}

特别说明： 多分支也可以没有最后的else

### 练习

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%205.png)

### 嵌套分支

规范：不要超过3层，可读性不好

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%206.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%207.png)

### Switch分支控制

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%208.png)

语法：

**switch**(表达式) {

case 常量1:

语句块1；

break;

case 常量2:

语句块2；

break;

default:

default语句块;

//break;

}

- 细节
    
    1.表达式数据类型，应和case后的常量类型一致，或者是可以自动转成可以相互比较的类型，比如输入的是**字符**，而常量是int
    
    1. switch表达式返回值必须是**byte,short,int,char,enum(枚举),string**
    2. case子句中的值必须是常量,计算得到的常量也可以(常量表达式)，不能是变量。
    3. default子句可选，没有匹配的case，执行default。
    4. break语句在执行完一个case分支后使程序跳出switch语句块；如果没有写break，程序会顺序执行到switch结尾

练习

穿透

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%209.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2010.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2011.png)

如果判断的具体数值不多，而且符合byte,short,int,char,enum,string这六种类型，建议用switch。

对结果为boolean类型判断，使用if，范围更广

## 循环控制(for while do.. while **多重循环**)

### **for循环控制**

语句

for (循环变量初始化;循环条件;循环变量迭代) {

循环操作;

}

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2012.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2013.png)

循环条件是返回值是True或False的表达式

如果变量i在for循环之后还想使用，写在for内部，该变量仅作用于此循环           可以写     for( ; 循环条件 ; )  

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2014.png)

for(;;)表示一个死循环

循环初始值、循环变量迭代 可以有多条语句，但是类型要一样，并且中间用逗号隔开。

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2015.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2016.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2017.png)

↓升级版，可以获取输入的值来自定义范围和倍数↓

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2018.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2019.png)

### while循环控制

循环变量初始化;

while (循环条件) {

循环体语句;

循环变量迭代；

}

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2020.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2021.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2022.png)

### do.. while循环控制

循环变量初始化;

do{

循环体(语句);

循环变量迭代;

}while(循环条件);

先执行，再判断，至少执行一次。分号结尾

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2023.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2024.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2025.png)

### 多重循环

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2026.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2027.png)

`//统计3个班成绩情况，每个班有5名同学，求出各个班的平均分和所有班级的平均分[学生的成绩从键盘输入]。统计三个班及格人数，每个班有5名同学。`

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2028.png)

九九乘法表

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2029.png)

```
/*思路分析
*   1.先打印一个矩形
*   2. 打印半个金字塔
*     *
*     **
*     ***
*     ****
*     *****
*   3.3。打印整个金字塔
         *          第1层有1个*  2*1-1   有4=(总层数-1)个空格
        ***         第2层有3个*  2*2-1   有3=(总层数-2)个空格
       *****        第3层有5个*  2*3-1   有2=(总层数-3)个空格
      *******       第4层有7个*  2*4-1   有1=(总层数-4)个空格
     *********      第5层有9个*  2*5-1   有0=(总层数-5)个空格
    4.打印空心金字塔
  当前行第一个位置是*，最后一个位置也是*
         *          第1层有1个*
        * *         第2层有2个*
       *   *        第3层有2个*
      *     *       第4层有2个*
     *********      第5层有9个*
 */
```

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2030.png)

## break

break语句用于终止某个语句块的执行，

一般在switch或循环中

break语句出现在多层嵌套的语句块时，可以通过标签指明要终止的是哪一层的语句块，例如:laber1(任意)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2031.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2032.png)

break语句可以指定退出那一层

label1是标签，自定义名字

break后指定到哪个label就退出到哪里

如果没有break标签，默认退出最近的循环体

`//实现登录验证，有3次机会，// 如果用户名为”丁真”，// 密码“666“提示登录成功否则提示还有几次机会，请使用for+break完成`

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2033.png)

## continue

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2034.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2035.png)

i = 3;

i = 4;

i = 5;

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2036.png)

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2037.png)

## return

return使用在方法,表示跳出所在方法

return写在main方法,会退出程序

![Untitled](Chapter04%20414141dbe3184d27bd4cbc6c21bd6b2e/Untitled%2038.png)