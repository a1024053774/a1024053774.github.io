---
layout: book
book: backend-map
permalink: /backend-map/
title: "后端知识地图"
subtitle: "从一次请求出发，读懂数据库、缓存与消息队列"
date: 2026-10-10 10:19:22 -0400
author: LuckyE
header-style: text
tags: [后端, MySQL, Redis, 消息队列]
comments: false
notion_source: "https://app.notion.com/p/3fdfaa7adad880318802d60d5640007a"
notion_snapshot_at: "2026-10-18T14:08:14.123Z"
---

## 一条请求，连接后端的几个核心问题

用户查看一件商品、提交一笔订单，背后会经过网络通信、数据库查询、缓存读取和异步任务处理。这份地图以电商场景为主线，将相关概念放回同一个业务流程中理解。

![后端知识地图：用户请求经过网络与后端服务，连接 MySQL、Redis、消息队列及分布式服务](/img/in-post/2026-10-18-backend-map/overview.png){: width="2298" height="1228" loading="lazy" decoding="async" }

## 章节目录

{% include book-chapters.html %}

## 阅读顺序

1. **先看请求全貌。** 第一章串起网络、数据库、缓存、消息队列和多服务实例，了解各部分为什么存在。
2. **理解数据如何存得住、改得对、查得快。** 第二章从建表进入事务、并发扣减和索引。
3. **再看缓存解决了什么，又带来什么问题。** 第三章介绍 Redis 的数据结构、过期时间、旁路缓存与缓存失效场景。
4. **最后进入异步工作。** 第四章讨论消息路由、发布与消费确认、重复消费、幂等和事务发件箱。

章节页提供全书目录和上下章导航，可以顺序阅读，也可以直接进入需要回看的主题。
