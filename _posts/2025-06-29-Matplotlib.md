---
layout:       post
title:        "Matplotlib"
subtitle:     "绘图基础与常见图表示例"
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - Python
    - Matplotlib
---

# Matplotlib

# 导入库

`import matplotlib.pyplot as plt`

# 基础绘制

## 绘制直线

```python
#从(0,0)到(6,250)的线段
xpoints = np.array([0, 6])
ypoints = np.array([0, 250])
plt.plot(xpoints, ypoints)
plt.show()
```

![image.png]({{site.baseurl}}/img/in-post/2025-06-29-Matplotlib/image.png)

## 无线绘图

```python
plt.plot(xpoints, ypoints, 'o')
plt.show()
```

![image.png]({{site.baseurl}}/img/in-post/2025-06-29-Matplotlib/image%201.png)

## 多点

```python
#多点,从(1,3) 到(2,8) 到(6,1) 到(8,10)
xpoints = np.array([1, 2, 6, 8])
ypoints = np.array([3, 8, 1, 10])
plt.plot(xpoints, ypoints)
plt.show()
```

![image.png]({{site.baseurl}}/img/in-post/2025-06-29-Matplotlib/image%202.png)

## 默认X点

如果我们不指定×轴上的点，它们将获得默认值0、1、2、3（等等，取决于y点的长度。

```python
#默认X点
ypoints = np.array([3, 8, 1, 10, 5, 7])
plt.plot(ypoints)
plt.show()
```

![image.png]({{site.baseurl}}/img/in-post/2025-06-29-Matplotlib/image%203.png)

# 标记

```python
ypoints = np.array([3, 8, 1, 10, 5, 7])
plt.plot(ypoints, marker='o', markerfacecolor='red', markersize=10, color='skyblue', linewidth=4)
plt.title('Marker Example')
plt.show()

plt.plot(ypoints, 'o:r') # 'o'表示圆形标记，':r'表示红色虚线
plt.show()
```

# 其他图

```python
# 条形图示例
x = np.array(['A', 'B', 'C', 'D', 'E'])  # 定义x轴标签
y = np.array([3, 8, 1, 10, 5])  # 定义y轴数据
plt.bar(x, y, color='skyblue', width=0.4)  # 绘制竖直条形图，设置颜色和宽度
plt.show()  # 显示图形

# 水平条形图示例
plt.barh(x, y, color='skyblue', height=0.4)  # 绘制水平条形图，设置颜色和高度
plt.show()  # 显示图形

# 直方图示例
#一共250个数据点，平均值170，标准差10
x = np.random.normal(170, 10, 250)  # 生成250个均值为170、标准差为10的正态分布数据
print(x)  # 打印生成的数据
plt.hist(x, color='skyblue')  # 绘制直方图，设置颜色
plt.show()  # 显示图形

# 散点图示例
x = np.random.normal(170, 10, 250)  # 生成x轴数据
y = np.random.normal(170, 10, 250)  # 生成y轴数据
plt.scatter(x, y, color='skyblue')  # 绘制散点图，设置颜色
plt.title('Scatter Plot Example')  # 设置图表标题
plt.xlabel('X-axis')  # 设置x轴标签
plt.ylabel('Y-axis')  # 设置y轴标签
plt.show()  # 显示图形

# 饼图示例
labels = ['Apple', 'Banana', 'Cherry', 'Date']  # 定义饼图标签
sizes = [15, 30, 45, 10]  # 定义每个扇区的大小
explode = (0.1, 0, 0, 0)  # 突出显示第一个扇区
plt.pie(sizes, explode=explode, labels=labels, shadow=True, autopct='%1.1f%%')  # 绘制饼图，设置突出、标签、阴影和百分比显示
plt.axis('equal')  # 确保饼图为圆形
plt.legend(title = "Four") # 添加图例并设置标题
plt.show()  # 显示图形
```
