---
layout:       post
title:        "Java-Phase02"
subtitle: '第二阶段'
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - Java
---


# 第二阶段

### 类变量(静态变量)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%201.png)

静态变量不在对象属性里,由所有对象实例共享

static类变量,在类加载时就生成,不用new对象就可调用

**细节**

1. 需要让某个类的所有对象都共享一个变量时，就可以考虑使用类变量（静态变量)
2. 类变量是该类的所有对象共享的，而实例变量(属性)是每个对象独享的。
3. (推荐)用 类名.类变量名 的方式访问
4. 类变量的生命周期是随类的加载开始，随着类消亡而销毁。
5. 类方法无this,super参数
6. 静态方法只能访问静态成员(变量,方法)(必须遵守访问权限)
7. 非静态方法,既可以访问非静态成员,也可以访问静态成员(必须遵守访问权限)

比如Math.sqrt,就不用创建对象

## main方法

1. main方法是Java虚拟机调用的
2. java虚拟机需要调用类的main()方法，所以该方法的访问权限必须是public
3. Java虚拟机再执行main方法时不必创建对象,所以该方法必须是static
4. 该方法接收String类型的数组参数
    
    该数组中保存执行java命令时传递给所运行的类的参数
    
5. java 执行的程序 参数1 参数2 参数3
    
    ![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%202.png)
    
    ![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%203.png)
    

## 代码块

和方法不同，没有方法名，没有返回，没有参数，只有方法体，而且不用通过对象或类显式调用，而是加载类时，或创建对象时隐式调用。

基本语法

[修饰符]{

代码

};

1. 修饰符可选,但是只能用static
2. 用static修饰的叫静态代码块,没有,叫普通代码块

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%204.png)

细节

1. static代码块也叫静态代码块，作用就是对类进行初始化，而且它随着类的加载而执行，并且只会执行一次。如果是普通代码块，每创建一个对象，就执行。
2. 类什么时候被加载
    1. 创建对象实例时（new）
    2. 创建子类对象实例，父类也会被加载
    3. 使用类的静态成员时（静态属性，静态方法）
3. 普通的代码块，在创建对象实例时，会被隐式的调用被创建一次，就会调用一次。如果只是使用类的静态成员时，普通代码块并不会执行。

## 单例设计模式

单个的实例 

饿汉式  未使用就创建   随着类的加载就创建

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%205.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%206.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%207.png)

懒汉式   当用户使用getInstance时,才返回cat对象,后面再次调用,会返回上次创建的cat对象

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%208.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%209.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2010.png)

区别

1. 二者最主要的区别在于创建对象的时机不同：饿汉式是在类加载就创建了对象实例而懒汉式是在使用时才创建。
2. 饿汉式不存在线程安全问题，懒汉式存在线程安全问题。
3. 饿汉式存在浪费资源的可能。因为如果程序员一个对象实例都没有使用，那么饿汉式创建的对象就浪费了，懒汉式是使用时才创建，就不存在这个问题。
4. java.lang.Runtime就是经典的单例模式。

## final关键字

可以修饰 类,属性,方法和局部变量

1) 当不希望类被继承时，可以用final修饰

2) 当不希望父类的某个方法被子类覆盖/重写（override）时，可以用final关键字

3) 当不希望类的的某个属性的值被修改，可以用final修饰。

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2011.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2012.png)

4) 当不希望某个局部变量被修改，可以使用final修饰

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2013.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2014.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2015.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2016.png)

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2017.png)

## 抽象类

当父类的某些方法，需要声明，但是又不确定如何实现时，

可以将其声明为抽象方法，那么这个类就是抽象类

                          无方法体

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2018.png)

**细节**

1. 抽象类不能被实例化
2. 抽象类可以没有抽象方法.还可以有实现的方法
3. abstract只能修饰方法和类
4. 抽象类本质还是类,可以拥有任意成员
5. 如果一个类继承了抽象类，则它必须实现抽象类的所有抽象方法，除非它自己也声明为abstract类。
    
    ![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2019.png)
    
6. 抽象方法    **不能使用**private、finai和static来修饰  **抽象类要依靠重写来实现**
    
    

## 接口

接口就是给出一些没有实现的方法封装到一起，到某个类要使用的时候，在根据具体情况把这些方法写出来。

Jdk7.0前接口里的所有方法都没有方法体，即都是抽象方法。

Jdk8.0后接口可以有静态方法，默认方法，也就是说接口中可以有方法的具体实现

![Untitled](%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5%202aebcf0bcb5a4e8fbc1d19af60ee9277/Untitled%2020.png)

## **细节**

1. 接口不能被实例化
2. 接口中所有的方法是public方法,接口可以省略abstract
3. 一个普通类实现接口,那么该接口的所有方法都要实现 alt + enter自动补全
4. 抽象类实现接口可以不用实现方法
5. 一个类可以实现多个接口
6. 接口中的所有属性都得是public static final修饰符
    
    写了int a = 1 实际上是 public static final int a = 1;
    
7. 接口中属性的访问形式：接口名.属性名
8. 接口不能继承其他类,但能继承多个别的接口
9. 接口的修饰符只能是public和默认，这点和类的修饰符是一样的。

## **继承VS接口**

当子类继承了父类,就自动拥有父类的方法

如果子类需要扩展方法,可以通过实现接口的方式扩展

实现接口是对Java单继承机制的补充

继承的价值主要在于：解决代码的复用性和可维护性接口的价值主要在于：设计，设计好各种规范（方法)，让其它类去实现这些方法。即更加的灵活..

## **接口的多态**

1. 一个接口可以被多个类实现
