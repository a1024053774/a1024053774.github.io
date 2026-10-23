"""博客文章 _posts/2026-10-20-a2a-multi-agent-design.md 的验收：改写成 Enchanted 说明文档后必须满足的事实与格式。

在博客仓库根目录运行：python3 _checks/enchanted_post_check.py；全部满足时退出码 0。
依据：用户要求（改写成 Enchanted 的理念与设计说明）与 a2a 仓库的事实材料（README、产品页、0.1.2 发布说明）。
"""
import re, sys
from pathlib import Path

post = Path('_posts/2026-10-20-a2a-multi-agent-design.md')
text = post.read_text(encoding='utf-8')
problems = []
def need(ok, message):
    if not ok: problems.append(message)

match = re.match(r'---\n(.*?)\n---\n', text, re.S)
need(match, 'front matter 缺失')
front = match.group(1) if match else ''
field = lambda name: (re.search(rf'^{name}:\s*(.+)$', front, re.M) or [None, ''])[1].strip()
need(field('layout') == 'post', 'layout 必须是 post')
need(field('permalink') == '/2026/10/11/a2a-multi-agent-design/', 'permalink 必须保持 /2026/10/11/a2a-multi-agent-design/，产品页“文档”链接指向它')
need(field('date').startswith('2026-10-20'), 'date 不能改')
need('Enchanted' in field('title'), 'title 要用产品名 Enchanted')
for image in ('roles.svg', 'gate.svg'):
    need(f'](/img/in-post/2026-10-11-a2a-design/{image})' in text, f'缺少插图引用 {image}')
    need(Path('img/in-post/2026-10-11-a2a-design', image).is_file(), f'插图文件不存在 {image}')
need('mmdc' in text and '@mermaid-js/mermaid-cli@12.0.0' in text, '文末重新生成插图的 HTML 注释要保留')
need('软件完成后' not in text and '没有产品截图' not in text, '软件已发布 0.1.2，删掉“完成后补截图”“没有产品截图”这类过时说法')
need('https://a1024053774.github.io/Enchanted/' in text, '缺少产品页链接')
need('https://github.com/a1024053774/Enchanted/releases' in text, '缺少下载链接')
need('xattr -dr com.apple.quarantine /Applications/Enchanted.app' in text, '缺少解除隔离的命令')
for name in re.findall(r'Enchanted[-\w.]*\.zip', text):
    need(name == 'Enchanted-0.1.2-macos-arm64.zip', f'安装包文件名不对：{name}（0.1.2 的实际文件名是 Enchanted-0.1.2-macos-arm64.zip）')
need('controller_answer' not in text, '不出现内部字段名 controller_answer')
need(len(text.encode('utf-8')) <= 28263, '篇幅不能长于原文（28263 字节）')
need(not re.search(r'(提升|提高|降低|节省)了?\s*\d+(\.\d+)?\s*%', text), '不做效率、可靠性、成本的收益声明')

for message in problems: print('FAIL', message)
print('PASS' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
