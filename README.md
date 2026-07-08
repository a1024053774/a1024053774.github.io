# LuckyE Blog

遠山江浸月的个人技术博客，主要记录 Java、Python、数据库、强化学习与 RLHF。站点使用 Jekyll 生成静态页面，并由 GitHub Actions 发布到 GitHub Pages。

[访问博客](https://a1024053774.github.io) · [浏览标签](https://a1024053774.github.io/tags/)

## 页面预览

### 首页与内容发现

首页现在会展示公开文章数、活跃标签和最近更新时间，并按修改时间组织内容。

![博客首页概览](docs/screenshots/home-overview.jpg)

文章可通过卡片堆叠、滚轮、左右按钮或分页圆点切换，也能恢复为传统列表视图。

![首页卡片堆叠](docs/screenshots/home-card-stack.jpg)

### 标签浏览

标签页只索引公开文章，支持按主题即时过滤，并显示每个标签对应的文章数量。

![标签浏览页](docs/screenshots/tag-explorer.jpg)

### 阅读与讨论

文章页统一了阅读时间、文章元数据、代码块、数学公式和固定目录的视觉样式。

![文章阅读页](docs/screenshots/post-reading.jpg)

评论区新增读者反馈墙、快捷身份和评论服务状态提示；配置 Waline 后可直接开放公共留言。

![读者反馈与评论区](docs/screenshots/reader-comments.jpg)

## 最近更新

本轮更新对应 2026-07-06 至 2026-07-07 的站点重构：

- 全站改为支持明暗主题的 Liquid Glass 视觉体系，统一导航、按钮、卡片、搜索层、侧栏和评论区。
- 首页新增文章统计、最近更新排序、精选标签、循环卡片堆叠以及卡片/列表视图切换。
- 新增独立标签探索页；标签索引、文章摘要和更新时间由构建插件统一生成，并自动排除隐藏文章。
- 改进站内搜索的打开、关闭、结果滚动和移动端布局。
- 重做文章阅读体验，包括阅读时间、代码块语言标识与复制操作、MathJax 兼容、阅读进度和固定目录。
- 评论系统改为统一的 Waline / Disqus 适配入口，并提供快捷身份、状态说明和静态读者反馈展示。
- 调整 Service Worker 缓存与资源版本，修复 GitHub Pages 部署后的旧资源、交互脚本和搜索层问题。
- 修复 About 页面侧栏在桌面布局中掉到正文下方的问题，并补齐移动端响应式细节。

## 21st.dev 素材与设计参考

本项目参考了以下 [21st.dev](https://21st.dev) 社区素材。由于本站是 Jekyll 项目，相关效果已改写为 Liquid 模板、Less 和原生 JavaScript，没有直接引入这些 React 组件作为运行时依赖。

| 参考素材 | 作者 | 本项目中的应用 |
| --- | --- | --- |
| [CardStack](https://21st.dev/community/components/ruixen.ui/card-stack) | Ruixen UI | 首页文章卡片的堆叠、循环切换和分页状态 |
| [Testimonials Columns](https://21st.dev/community/components/efferd/testimonials-columns-1/default) | Efferd | 评论区的读者反馈标题、卡片分栏和响应式排列 |
| [LiquidGlass](https://21st.dev/community/components/manfromexistence/liquid-glass) | Man From Existence | 导航、操作按钮、内容面板及明暗主题的玻璃质感 |

上述条目用于标明视觉与交互参考来源；具体实现、内容结构和 Jekyll 适配均保存在本仓库中。各素材的使用条件以对应 21st.dev 页面及其上游项目许可为准。

## 技术栈

- Jekyll、Liquid、Kramdown
- Less、Bootstrap 3、原生 JavaScript
- Waline / Disqus 评论适配
- MathJax、PWA Service Worker
- Grunt 样式构建
- GitHub Actions、GitHub Pages

## 本地开发

环境要求：Ruby、Bundler、Node.js 和 pnpm。

```bash
bundle install --path vendor/bundle
pnpm install
pnpm run build:css
bundle exec jekyll serve
```

默认访问地址为 <http://127.0.0.1:4000/>。

仅构建静态站点：

```bash
bundle exec jekyll build
```

## 目录说明

```text
_posts/      博客文章
_layouts/    页面布局
_includes/   导航、搜索、评论等可复用片段
_plugins/    构建期文章元数据与标签索引
less/        Less 样式源码
css/         编译后的样式
js/          页面交互脚本
img/         站点与文章图片
docs/        README 截图等仓库文档资源
```

## 评论配置

评论系统配置位于 `_config.yml` 的 `comment_system`。当前 `provider: auto` 会在配置了 `comment_system.waline.server_url` 时启用 Waline，否则显示待配置状态；如需使用 Disqus，应将 `provider` 改为 `disqus` 并填写对应 shortname。要开放免社交账号的公共留言，需要为 Waline 填入已部署的服务地址。

## 部署

推送到主分支后，`.github/workflows/jekyll.yml` 会安装依赖、构建站点并发布到 GitHub Pages。样式修改后应同步执行 `pnpm run build:css`，确保 `css/` 中的构建产物与 `less/` 源码一致。

## 说明

- 博客内容位于 `_posts/`，页面主要位于仓库根目录、`_layouts/` 和 `_includes/`。
- 源码中保留的第三方版权声明用于满足对应开源许可要求。
- `_site/` 是本地构建产物，不应作为手工维护的源码。
