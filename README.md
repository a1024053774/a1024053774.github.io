# LuckyE Blog

个人 GitHub Pages 博客仓库，当前使用 Jekyll + GitHub Actions 部署。

## Local Development

1. `bundle install --path vendor/bundle`
2. `pnpm install`
3. `pnpm exec grunt less`
4. `bundle exec jekyll serve`

默认访问地址：`http://127.0.0.1:4000/`

## Deployment

站点通过 `.github/workflows/jekyll.yml` 构建并发布到 GitHub Pages。

## Notes

- 博客内容位于 `_posts/`、页面位于根目录和 `_includes/`
- 主题样式产物位于 `css/`，源码位于 `less/`
- 源码中保留的第三方版权声明用于满足开源许可要求
