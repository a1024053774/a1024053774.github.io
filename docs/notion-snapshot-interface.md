# Notion 页面快照接口

博客把 Notion 页面当成一种可替换的数据源。章节保存在 `_chapters/`，并在 front matter 声明两个键：

```yaml
notion_source: "https://app.notion.com/p/<page-id>"
notion_discussions: <data-key>
```

`notion_discussions` 对应 `_data/notion/<data-key>.json`。渲染层由 `_includes/notion-discussions.html` 和 `js/notion-discussions.js` 负责，适用于任何包含正文批注和讨论线程的页面，不绑定当前文章。

快照数据的最小结构如下：

```json
{
  "source_url": "https://app.notion.com/p/<page-id>",
  "snapshot_at": "2026-10-15T14:29:42.180Z",
  "last_edited_at": "2026-10-15T14:29:02.179Z",
  "discussion_count": 1,
  "discussions": [
    {
      "anchor": "notion-discussion-01",
      "id": "discussion://...",
      "source_url": "https://app.notion.com/p/<page-id>?d=...",
      "text_context": "批注对应的正文片段",
      "resolved": false,
      "comment_count": 1,
      "comments": [
        {
          "id": "comment-id",
          "author": "作者",
          "datetime": "2026-10-15T10:21:46.669Z",
          "by_you": true,
          "html": "评论正文，保留 Notion 输出的行内换行"
        }
      ]
    }
  ]
}
```

评论的 `html` 必须是已整理的静态行内 HTML，不能把 Notion 增强 Markdown 的反引号或转义序列原样存入。发布内容不包含登录态或凭据。

正文里的批注锚点使用 `data-notion-discussion="notion-discussion-01"`。批注面板支持从正文打开对应线程、从线程返回正文，以及跳回公开 Notion 讨论。支持重叠批注、键盘 Enter/Space 打开、Escape 关闭及深链接。博客的 Waline 访客评论仍由现有评论组件处理，两者保持独立。

以后发布另一篇公开 Notion 页面时，只需生成同一结构的正文快照和 JSON 数据，复用这套 front matter 和渲染接口即可；不需要新建文章模板或 JavaScript 适配器。快照是静态证据，页面更新后重新生成快照并提交即可。

正文必须先归一化为博客支持的 Markdown：围栏顶格并保留完整代码；段落之间留空行；引用链接改为真实锚点；问题与回答分块。发布前运行 `python3 tests/check_books.py --site _site` 核对实际 HTML。
