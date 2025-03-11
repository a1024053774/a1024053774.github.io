# Chapter01

# Introduction+转义字符+注释+代码规范+DOS

# 1.Introduction

Java编译:   javac [Test.java](http://Test.java)    

乱码javac -encoding UTF-8 Test.java

运行:  java Test

解释性语言: javascript,PHP,Java

编译性语言：c/c++

解释性语言需要解释器来执行，编译性语言可以直接被机器执行

- 一个源文件中最多有一个public类，其它类的个数不限，可将main方法写在非public类中，然后运行该类，如下面的 java Tiger或java Dog,这是非public的main方法
- 源文件包含一个public类，则文件名必须按该类名命名！

- 编译后，每一个类对应一个.class

![Untitled](Chapter01%208b518d1acc2f4c4699b4dbd880f5f13d/Untitled.png)

- 公有类名必须与文件名一致

# 2.转义字符+注释+代码规范

# 转义字符

ChangeChar

- \t 制表位，对齐
- \n 换行符
- \\   一个\           \\\\  两个\
- \”  一个”
- \r  一个回车
- 回车会将输入指针指向开头，替换开始的字符，结果变成     北京教育

```java
System.out.println("老王教育\r北京");
```

### 练习

![Untitled](Chapter01%208b518d1acc2f4c4699b4dbd880f5f13d/Untitled%201.png)

![Untitled](Chapter01%208b518d1acc2f4c4699b4dbd880f5f13d/Untitled%202.png)

```java
//转义字符
public class ChangeChar {
	public static void main(String[] args) {
		System.out.println("北京\t天津\t上海");
		System.out.println("北京\n天津\n上海");
		System.out.println("老王教育\r北京");
		System.out.println("老王教育\r\n北京");

		System.out.println("书名\t作者\t价格\t销量\n三国\t罗贯中\t120\t1000");
	}
}
```

# 注释

```java
//单行注释
```

```java
/*  
		这是多行
    注释
    多行注释
    多行注释里不能嵌套多行注释
*/
```

### 文档注释

```powershell
javadoc -d E:\JavaLearn\doc\PageComment -author -version PageComment.java
javadoc -d 路径 标签 文件名
```

```java
//文档注释

/**
 * 
 * @author yrh
 * @version 1.0
 * 
 */ 

public class PageComment {
	public static void main(String[] args) {
		
	}
}
```

| 
  标签
   | 
  描述
   |
| --- | --- |
| 
  @author
   | 
  标识一个类的作者
   |
| 
  @deprecated
   | 
  指名一个过期的类或成员
   |
| 
  {@docRoot}
   | 
  指明当前文档根目录的路径
   |
| 
  @exception
   | 
  标志一个类抛出的异常
   |
| 
  {@inheritDoc}
   | 
  从直接父类继承的注释
   |
| 
  {@link}
   | 
  插入一个到另一个主题的链接
   |
| 
  {@linkplain}
   | 
  插入一个到另一个主题的链接，但是该链接显示纯文本字体
   |
| 
  @param
   | 
  说明一个方法的参数
   |
| 
  @return
   | 
  说明返回值类型
   |
| 
  @see
   | 
  指定一个到另一个主题的链接
   |
| 
  @serial
   | 
  说明一个序列化属性
   |
| 
  @serialData
   | 
  说明通过writeObject( ) 和 writeExternal( )方法写的数据
   |
| 
  @serialField
   | 
  说明一个ObjectStreamField组件
   |
| 
  @since
   | 
  标记当引入一个特定的变化时
   |
| 
  @throws
   | 
  和
  @exception标签一样.
   |
| 
  {@value}
   | 
  显示常量的值，该常量必须是static属性。
   |
| 
  @version
   | 
  指定类的版本
   |

# Java代码规范

- 类、方法的注释，要以javadoc的方式来写
- 非JavaDoc的注释，往往是给代码的维护者看的
- tab整体右移，shift+tab整体左移
- 运算符左右带空格

# 3.DOS

```powershell
md d:\\aaa      创建目录
rd d:\\aaa      移除目录
copy
delete
echo[输入内容到文件]
type
move 
```

![Untitled](Chapter01%208b518d1acc2f4c4699b4dbd880f5f13d/Untitled%203.png)

- 查看当前目录有哪些内容
- 

```powershell
dir 目录
dir d:\abc\123
```

- 切换目录
- 

```powershell
由D盘切换到切换到c盘
cd /D c: 

切换到当前盘其他目录
cd 路径

切换到上一级
cd ..\

切换到根目录
cd \
```

- 目录树
- 

```powershell
tree c:\
```

- 清屏 cls
- 退出 exit

## HomeWork

```powershell
public class HomeWork01 {
	public static void main(String[] args) {
		//作业1
		System.out.println("Hello,world");
		
		//作业2
		System.out.println("name\tsex\tpro\taddress\nyrh\tman\thenan\tny");
	
		//作业3
		// JDK = JRE + JAVA开发工具
		// JRE = JVM + 核心类库

		//作业4
		//环境变量为了在dos的任意目录可以使用java 和 javac命令

		//作业5
		//javac 编译 得到对应的.class文件
		//java 运行 把.class加载到jvm运行

		//作业6
		//Java编写7个规范
		//1.类，方法的注释，使用javadoc的方式，即文档注释
		//2.非javadoc注释，往往是对代码的说明（给程序的维护者），说明如何修改，注意事项
		//3.使用tab，整体将代码右移，使用shift+tab整体左移
		//4.运算符和=的两边，给空格，代码看上去清楚int n=1+4；
		//5.源码文件使用utf-8编码
		//6．行宽字符不要超过80
		//7.代码编程风格有两种次行风格，行尾风格（推荐)

	}
}
```