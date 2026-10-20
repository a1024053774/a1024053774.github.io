---
layout: post
book: backend-map
order: 1
chapter_label: 第 1 章
title: "从一次用户请求理解整个后端"
subtitle: "从商品详情请求串起网络、数据库、缓存、消息队列与分布式服务"
date: 2026-10-10 10:19:22 -0400
author: LuckyE
header-style: text
tags: [后端, MySQL, Redis, 消息队列]
comments: false
notion_source: "https://app.notion.com/p/3fdfaa7adad880318802d60d5640007a"
notion_snapshot_at: "2026-10-18T14:08:14.123Z"
---

假设你开发了一个类似淘宝的网站，用户点击一件商品：

![用户点击查看商品详情：无线耳机的价格、商品 ID 与库存](/img/in-post/2026-10-18-backend-map/chapter-01-01.png){: width="1078" height="254" loading="lazy" decoding="async" }

## 1. 计算机网络：请求是怎么发送的？

当用户打开`https://shop.example.com/products/1001`会发生什么？

1. DNS 查询：找到 `shop.example.com` 对应的服务器 IP 地址。
2. 建立连接：对于常见的 HTTP/1.1、HTTP/2，<strong>使用 TCP 建立可靠连接</strong>，并通过 TLS 建立加密通信。
3. 发送 HTTP 请求：浏览器向后端请求商品 ID 为 1001 的数据。
4. 接收 HTTP 响应：<strong>服务器返回 JSON，</strong>浏览器将数据呈现为商品页面。

HTTP 请求可以长这样：

```http
GET /products/1001 HTTP/1.1
Host: shop.example.com
Accept: application/json
```

服务器可能返回：

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1001,
  "name": "无线耳机",
  "price": 299,
  "stock": 50
}
```

这里要理解三个概念：

- TCP：负责提供可靠、有序的数据传输。
- HTTP：定义客户端与服务端如何表达请求和响应。
- HTTPS：使用 TLS 保护 HTTP 通信内容。

> HTTP 和 TCP 有什么区别？
>
> TCP 解决数据如何可靠传输的问题，而 HTTP 规定应用程序如何组织和解释请求、响应。它们处在不同层次。需要注意，<strong>HTTP/3 使用的是基于 UDP</strong> 的 QUIC，而不是 TCP。

## 2. 数据库：商品信息从哪里来？

服务器接收到请求后，需要查询商品数据，这些信息通常保存在 MySQL 这样的关系型数据库中。

```sql
SELECT id, name, price, stock
FROM products
WHERE id = 1001;
```

数据库查到这条记录，再交给 Python 后端生成响应。

这里就引出了三个核心问题：

1. **为什么要用数据库，而不是把数据存进 Python 变量？**

   因为 Python 进程终止后，内存里的普通变量就没了。数据库提供持久化、查询、并发访问控制、事务等能力。
2. **数据库为什么需要索引？**

   你可以把索引想象成一本书的目录。如果表里有一百万条商品记录，没有合适索引时可能需要扫描大量数据；利用主键索引，就可以更高效地定位商品。
3. **两个人同时购买最后一件商品怎么办？**

   <u>这涉及并发更新、事务和锁。</u>不能简单地先查询库存，再直接减少，因为两个请求可能都看到库存为 1，最终发生超卖。

## 3. Redis：为什么有了 MySQL 还需要它？

设想一款爆火的耳机，有十万名用户在短时间内查看商品详情,如果每次都访问 MySQL，数据库可能承受很大的读取压力,于是我们引入 Redis。

![最经典的 Cache Aside（旁路缓存） 模式](/img/in-post/2026-10-18-backend-map/chapter-01-02.png){: width="1518" height="594" loading="lazy" decoding="async" }

Redis 经常被用作缓存，是因为它主要<strong>在内存中操作数据</strong>，通常能够提供<strong>非常低的访问延迟</strong>。

> **假如商品价格从 299 元变成 199 元，而 Redis 中仍然是 299 元，该怎么办？**
>
> 这就是缓存一致性问题。
>
> 常见策略包括在数据库更新后删除相关缓存、设置缓存过期时间（TTL）等，但要根据业务要求处理并发和更新顺序，这也说明 Redis 不只是背几个命令，还需要理解它为什么存在。

## 4. 消息队列：为什么不让 Python 一次做完全部工作？

现在用户购买了耳机，订单创建成功后，我们希望执行这些操作：

1. 创建订单、更新库存。
2. 发送订单通知。
3. 更新运营统计。
4. 给用户发送邮件。

其中第一项通常是关键业务，必须可靠完成，但<strong>发送邮件可能要等待外部服务，</strong>如果都放进一个 HTTP 请求里同步执行，用户就得等待这些操作全部结束，所以我们可以引入消息队列（Message Queue，简称 MQ）。

![订单创建后通过消息队列处理异步任务](/img/in-post/2026-10-18-backend-map/chapter-01-03.png){: width="1532" height="884" loading="lazy" decoding="async" }

消息队列的三个经典作用：

- 异步处理：将不必在当前请求中完成的工作交给后台。
- 解耦：订单服务不需要直接管理邮件服务的执行过程。
- 削峰填谷：突发大量任务时，消费者可以<u><strong>按处理能力逐渐消化队列中的积压任务</strong></u>。

但消息队列不是魔法，它还带来了新的问题：消息可能重复、消费者可能崩溃、消息可能丢失，因此需要确认机制、重试、幂等处理以及可靠的消息发布方案。

## 5. 分布式与高并发：一台服务器不够怎么办？

假设网站发展得很好，原来每秒只有 10 个请求，现在变成每秒 10,000 个，这里先区分两个容易混淆的概念。

1. 高并发：大量请求在时间上重叠，需要系统同时处理。
2. 分布式系统：多个独立的计算节点通过网络协作，对外提供服务。

它们有关联，但并不等价，单机也能支持很高的并发，分布式系统也不一定是为高并发设计的。

![通过负载均衡将请求分配给多个后端服务实例](/img/in-post/2026-10-18-backend-map/chapter-01-04.png){: width="1538" height="916" loading="lazy" decoding="async" }

这样做可以提高处理能力与可用性，但也会出现新问题：

- 同一用户的两个请求分别到达不同机器，如何共享状态？
- 某台服务器宕机，如何把请求重新分配？
- 所有服务器同时访问 MySQL，数据库会不会成为瓶颈？
- 多个服务器同时扣减库存，如何避免超卖？
