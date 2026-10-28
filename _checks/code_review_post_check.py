"""博客文章 _posts/2026-10-27-claude-code-code-review.md 的验收：翻译发布 claude.dev 文章
《How the Claude Code team does code review》后必须满足的机械事实。

在博客仓库根目录运行：python3 _checks/code_review_post_check.py；全部满足时退出码 0。
依据：用户要求（发布这篇文章；PNG 配图翻译成中文；提炼核心理念）与原文
https://claude.dev/blog/solving-code-review-at-anthropic/ 的数据和 5 张配图。
译文是否通顺、配图是否美观、核心理念是否提炼到位，交独立审查与网页实查，本脚本不判断。
开头否定检查只是有限词表：自检中改述样本「底下这篇是我凭空想象出来的」未被拦下，
开头说明的含义须由独立审查确认。
"""
import re, struct, sys
from pathlib import Path

POST = Path('_posts/2026-10-27-claude-code-code-review.md')
IMG = Path('img/in-post/2026-10-27-claude-code-code-review')
SOURCE = 'https://claude.dev/blog/solving-code-review-at-anthropic/'
# 原文 5 张配图：图 A–D 是内嵌 SVG，第 5 张是 PNG。必须消失的英文取自原图文字。
FIGURES = {
    'life-of-a-change': ['The work is verified', 'Merge queue', 'Gradual release', 'roll back'],
    'review-layers': ['problems in', 'fast rollback', 'human approval'],
    'incident-eval': ['Incident or revert', 'Daily eval run', 'Score went up'],
    'convergence': ['Mean reviews to pass', 'convergence work', 'Need five or more rounds'],
    'context-sharing': ['Ask Claude about exactly that slice', 'managed settings', 'explainer'],
}
CONVERGENCE_NUMBERS = ['65%', '78%', '8.9%', '1.5%', '2.08', '1.32']
# 原文数据：约 90% 代码由 Claude 写；回滚占比下降逾 40%；收敛前后的轮次数据
BODY_FACTS = ['90', '40', '2.08', '1.32', '65%', '78%', '8.9%', '1.5%']
# 开头对全文真实性、有效性的整体否定。有限词表，改述漏网的情形交独立审查。
DENIAL = re.compile(r'虚构|杜撰|编造|随手编|瞎编|并非(原文|真实|翻译)|不是(原文|真实|翻译)|与原文无关|'
                    r'(数据|内容|信息)[^。\n]{0,6}(不可信|不准确|未经核实|仅供娱乐)|别当真|不要当真|'
                    r'仅为(示例|演示|测试)|测试(文本|内容|稿)|占位|作废|已撤回')
CJK = re.compile(r'[一-鿿]')
problems = []
def need(ok, message):
    if not ok: problems.append(message)

def png_size(path):
    head = path.read_bytes()[:24]
    if head[:8] != b'\x89PNG\r\n\x1a\n' or head[12:16] != b'IHDR': return None
    return struct.unpack('>II', head[16:24])

text = POST.read_text(encoding='utf-8') if POST.is_file() else ''
need(text, f'文章不存在：{POST}')
match = re.match(r'---\n(.*?)\n---\n', text, re.S)
need(match, 'front matter 缺失')
front = match.group(1) if match else ''
body = text[match.end():] if match else text
field = lambda name: (re.search(rf'^{name}:\s*(.+)$', front, re.M) or [None, ''])[1].strip().strip('"\'')
need(field('layout') == 'post', 'layout 必须是 post')
need(CJK.search(field('title')), 'title 要是中文标题')
need(SOURCE in body, f'缺少原文链接 {SOURCE}')

for name, english in FIGURES.items():
    png, svg = IMG / f'{name}.png', IMG / f'{name}.svg'
    need(re.search(rf'\]\((\{{\{{ site\.baseurl \}}\}})?/{re.escape(str(IMG))}/{name}\.png\)', body), f'正文缺少配图引用 {name}.png')
    size = png_size(png) if png.is_file() else None
    need(size, f'配图不是有效 PNG：{png}')
    need(not size or size[0] >= 1200, f'{name}.png 宽度不足 1200 像素：{size}')
    source = svg.read_text(encoding='utf-8') if svg.is_file() else ''
    need(source, f'缺少中文配图源文件 {svg}')
    labels = ''.join(re.findall(r'>([^<]*)<', source))
    need(len(CJK.findall(labels)) >= 10, f'{name}.svg 的文字不是中文')
    for phrase in english:
        need(phrase.lower() not in labels.lower(), f'{name}.svg 还留着原图英文「{phrase}」')
    if name == 'convergence':
        for number in CONVERGENCE_NUMBERS:
            need(number in labels, f'convergence.svg 缺少原图数据 {number}')

need(len(CJK.findall(body)) >= 4500, f'正文汉字 {len(CJK.findall(body))} 个，不像全文翻译（原文约 3300 个英文词）')
for fact in BODY_FACTS:
    need(re.search(rf'(?<![\d.]){re.escape(fact)}(?![\d.])', body), f'正文缺少原文数据 {fact}')

sections = re.split(r'^## ', body, flags=re.M)
core = [s for s in sections[1:] if '核心理念' in s.split('\n', 1)[0]]
need(core, '缺少标题含「核心理念」的二级小节')
need(core and len(CJK.findall(core[0])) >= 100, '「核心理念」小节没有实际内容')
need(not DENIAL.search(sections[0]), '开头否定了全文的真实性或有效性')

for message in problems: print('FAIL', message)
print('PASS' if not problems else f'{len(problems)} problem(s)')
sys.exit(1 if problems else 0)
