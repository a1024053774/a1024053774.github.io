# 合集与嵌套章节

首页、标签页和搜索结果都从 `site.posts` 取内容。Java、AI Agent 和后端知识地图各有一篇合集文章，分别固定在 `/java/`、`/ai-agent/` 和 `/backend-map/`；正文保存概览和目录。

章节属于 Jekyll 的 `chapters` 集合，保存在 `_chapters/`，不再是独立博客文章。目录、面包屑和上下章导航共用 `_includes/book-*.html`，直接读取章节的 `book`、`phase`、`order`、`chapter_label` 和 `title`。

后端知识地图沿用同一结构：概览位于 `/backend-map/`，四章位于 `_chapters/backend-map/`，首页、标签和搜索只收录概览入口。这组页面在 front matter 设置 `comments: false` 关闭博客评论，未配置 Notion 批注数据；其他文章的评论默认行为保持不变。以后新增不需要评论的章节或文章，也可使用这个开关。

例如 `_chapters/java/phase-01/chapter-01.md` 会生成 `/java/phase-01/chapter-01/`，`_chapters/ai-agent/chapter-01.md` 会生成 `/ai-agent/chapter-01/`。Java 合集正文用 `Phase 01`、`Phase 02` 两个一级标题分组；阶段名称来自 `_data/books.yml`。

AI Agent 第二章保存在 `_chapters/ai-agent/chapter-02.md`。以后增加章节时沿用同一结构，更新序号、标题与首次发布日期：

```yaml
---
layout: post
book: ai-agent
order: 2
chapter_label: 第 2 章
title: 上下文工程
date: 2026-10-18
author: LuckyE
header-style: text
tags: [AI Agent]
---
```

合集会自动列出它，章节页也会自动出现上下章链接。合集的最近更新时间会取自身与内部章节的最新修改时间；首页仍只显示一个合集入口，并按合集的首次发布日期排序。

首页「专栏」采用聚合标签，不再为每篇文章单独复制入口。`_data/home_series.yml` 只声明栏目名称、说明和聚合标签；文章在 front matter 中加入 `AI Agent`、`编程语言` 或 `后端与数据库` 等标签后，会自动进入对应栏目、计数与 `/tags/` 筛选结果。目前四个栏目都至少包含四篇公开内容，独立专题仍可通过普通标签检索，不会为了凑栏目而强行归类。

标签页按文章本身的 `date` 排序，首页、标签页和文章头部展示发布日期时统一读取 `published_on`。站点生成器从文章文件名的 `YYYY-MM-DD` 前缀生成 `published_on`，避免带时区的完整发布时间在 UTC 构建环境中跨日；`last_modified_at` 只作为内容更新信号。

A2A 文章的首次发布时间已更新为 2026-10-20，源文件也改用该日期；front matter 的 `permalink` 继续保留 `/2026/10/11/a2a-multi-agent-design/`，所以第二章中的双向交叉引用和外部旧链接不需要改写。

文章之间的关联阅读使用 `_includes/related-reading.html`，参数为 `title`、`summary`、`url` 和 `label`。在正文需要说明关联的位置调用，目标链接可带章节锚点；概述写清两处内容的联系和边界，不把相关概念当成同一机制。第二章与 a2a 的开头、状态栏／任务卡、上下文隔离／独立标准三处已复用此组件。

本次迁移删除了旧 Java 与 AI Agent 独立文章路由，没有保留副本或重定向。第一章的重复 Java 笔记合并为一份；原版中完整的 Javadoc 表格用于修复导出后断裂的表格。图片继续使用原有本地资源路径。

# 阅读格式检查

AI Agent 第一章使用普通 Markdown 围栏、表格和独立段落；Notion 折叠块使用带 `markdown="block"` 的 `<details>`。思考题有十个连续编号的 `.study-question` 区域，已有回答放入 `.study-answer`，未作答的问题不生成答案。

构建后的检查直接读取发布 HTML，覆盖首页入口、嵌套路径、完整 ReAct 伪代码、七个代码块、六张表格、八张图片、十道问题与十一条批注讨论。它不把“Jekyll 构建成功”当成内容渲染正确的证明。

```sh
npm run build:css
bundle exec jekyll build
python3 tests/check_books.py --site _site --report /tmp/book-contract.json
python3 tests/check_context_chapter.py --site _site --report /tmp/context-contract.json
python3 tests/check_backend_map.py --site _site --report /tmp/backend-contract.json
python3 tests/check_home_series.py --site _site --report /tmp/home-series.json
```

`tests/fixtures/react-loop.txt` 的预期来自 Notion 原始代码块；表格行数和问题数量来自原始内容的逐块清点。该检查在修复前版本上失败，并在 GitHub Actions 中于构建后执行。

# 浏览器阅读规则

`tests/reading.rules.json` 声明要验收的合集、独立文章和规则。`chapters` 指向章节源目录；测试按文件的 `order` 和显式 `permalink`（缺省沿用本站 `/:path/` 契约）发现章节。以后在这个目录新增章节，会自动进入同一套浏览器检查，无需逐章复制脚本。`minimumChapters` 防止空目录或漏页被当作通过。`articles` 用页面 URL、Markdown 源文件和评论开关登记单页长文；标题、代码块、图片与提示框数量直接从源文件计算，不把源文件或测试自己生成的数字当成预期。

```json
{
  "books": [{ "hub": "/backend-map/", "chapters": "_chapters/backend-map", "minimumChapters": 4, "comments": false }],
  "articles": [{ "url": "/javascript/", "source": "_posts/2025-10-19-javascript.md", "comments": false }],
  "rules": ["directory", "code", "tables", "theme", "viewport"],
  "overflowTolerancePx": 1
}
```

规则使用 Playwright 的真实浏览器页面入口，替代原先需手动绑定标签页的后端专用脚本：

- `directory`：概览逐章打开、完整目录、当前章节、上下章与返回合集，手机使用触摸点击。
- `code`：每个样本都被增强、正文不被截断、溢出区域可聚焦且能到达最右端；桌面额外检查方向键确实滚动内容。
- `tables`：表头、列数和单元格可见性，溢出表格的焦点与完整横向范围。
- `theme`：真实按钮切换、实际纸色与文字对比度、展开目录的颜色，以及重载和跨页保存。共享 `browser-reading-contrast.mjs` 计算背景叠色，小字门槛为 4.5，大字为 3。
- `viewport`：允许缩放，阅读区块位于视口内；代码和表格在自己的区域滚动，不把内容溢出藏在页面外。

独立文章会确认布局标题是页面唯一的一级标题，源文件中的二至五级标题全部出现在正文；每个代码块都完成增强且不被纵向裁切，至少一个样本产生真实横向滚动；图片完成加载；评论关闭时没有讨论组件或批注入口。Notion 等工具导出的提示框使用 `<aside class="article-note" markdown="1">`，共享样式位于 `less/article-notes.less`，内部 Markdown、代码块以及深浅色对比都进入同一组自动检查。

`reading-overflow.html` 作为独立输入注入实际章节响应，强制产生超长代码与宽表格；两种横向内容都必须超出容器 100px 以上，桌面左右方向键都必须真正移动内容。这个样例不发布为博客章节，避免当前文章恰好没有桌面溢出时漏掉键盘问题。代码与表格复用 `enhanceReadingScrollRegion(element, label)`，只有区域本身聚焦、确有横向溢出且没有组合键时才处理左右箭头，保留正文选择和其他控件的键盘行为。

```sh
npm ci
npx playwright install --with-deps webkit chromium
bundle exec jekyll build
npm run test:reading
```

默认执行桌面 WebKit、iPhone 13 配置的 WebKit、Pixel 7 配置的 Chromium。PR 和生产构建会运行同一命令，失败会阻止发布。报告保存在 `playwright-report/`，截图、对比度记录和失败轨迹保存在 `test-results/reading/`，Actions 保留证据 7 天；这些目录不会发布到博客。

检查线上版本时先确认本地章节清单与发布提交一致，再执行：

```sh
READING_BASE_URL=https://a1024053774.github.io npm run test:reading
```

设备配置模拟与 WebKit 测试不等同于实体 iPhone 或正式版 Safari。手机完整横向范围通过脚本验证，没有据此声称真实手势通过；移动 WebKit 不模拟外接键盘，方向键行为在桌面项目验证。本机 Safari 的人工操作与实体手机结果应分别记录。真实地址栏、安全区、触摸回弹和硬件键盘仍需要对应设备，参见 [Playwright 浏览器说明](https://playwright.dev/docs/browsers)与[设备模拟说明](https://playwright.dev/docs/emulation)。
