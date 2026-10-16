# 合集与嵌套章节

首页、标签页和搜索结果都从 `site.posts` 取内容。Java 和 AI Agent 各有一篇合集文章，分别固定在 `/java/` 和 `/ai-agent/`；正文只保存目录和简介。

章节属于 Jekyll 的 `chapters` 集合，保存在 `_chapters/`，不再是独立博客文章。目录、面包屑和上下章导航共用 `_includes/book-*.html`，直接读取章节的 `book`、`phase`、`order`、`chapter_label` 和 `title`。

例如 `_chapters/java/phase-01/chapter-01.md` 会生成 `/java/phase-01/chapter-01/`，`_chapters/ai-agent/chapter-01.md` 会生成 `/ai-agent/chapter-01/`。Java 合集正文用 `Phase 01`、`Phase 02` 两个一级标题分组；阶段名称来自 `_data/books.yml`。

以后增加 AI Agent 第二章，只需新增一个章节文件：

```yaml
---
layout: post
book: ai-agent
order: 2
chapter_label: 第 2 章
title: 上下文工程
date: 2026-10-16 10:00:00 -0400
author: LuckyE
header-style: text
tags: [AI Agent]
---
```

合集会自动列出它，章节页也会自动出现上下章链接。合集的最近更新时间会取自身与内部章节的最新修改时间，首页仍只显示一个合集入口。

本次迁移删除了旧 Java 与 AI Agent 独立文章路由，没有保留副本或重定向。第一章的重复 Java 笔记合并为一份；原版中完整的 Javadoc 表格用于修复导出后断裂的表格。图片继续使用原有本地资源路径。

# 阅读格式检查

AI Agent 第一章使用普通 Markdown 围栏、表格和独立段落；Notion 折叠块使用带 `markdown="block"` 的 `<details>`。思考题有十个连续编号的 `.study-question` 区域，已有回答放入 `.study-answer`，未作答的问题不生成答案。

构建后的检查直接读取发布 HTML，覆盖首页入口、嵌套路径、完整 ReAct 伪代码、七个代码块、六张表格、八张图片、十道问题与十一条批注讨论。它不把“Jekyll 构建成功”当成内容渲染正确的证明。

```sh
npm run build:css
bundle exec jekyll build
python3 tests/check_books.py --site _site --report /tmp/book-contract.json
```

`tests/fixtures/react-loop.txt` 的预期来自 Notion 原始代码块；表格行数和问题数量来自原始内容的逐块清点。该检查在修复前版本上失败，并在 GitHub Actions 中于构建后执行。
