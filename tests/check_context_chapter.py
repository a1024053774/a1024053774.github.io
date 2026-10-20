"""Check chapter 2 and its contextual, reciprocal links through published HTML."""
import argparse
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit

from check_books import Document, Element


def check_site(site):
    results = []

    def check(name, condition):
        results.append({'check': name, 'status': 'PASS' if condition else 'FAIL'})

    def document(path):
        file = site / path.strip('/') / 'index.html'
        return Document(file.read_text(encoding='utf-8')).root if file.exists() else Element()

    chapter_url = '/ai-agent/chapter-02/'
    a2a_url = '/2026/10/11/a2a-multi-agent-design/'
    chapter = document(chapter_url)
    check('Chinese chapter declares its document language', bool(chapter.all('html')) and chapter.all('html')[0].attrs.get('lang') == 'zh-CN')
    a2a = document(a2a_url)
    chapter_meta = {n.attrs.get('property'): n.attrs.get('content', '') for n in chapter.all('meta')}
    a2a_meta = {n.attrs.get('property'): n.attrs.get('content', '') for n in a2a.all('meta')}
    check('sharing summaries describe the article rather than an empty excerpt', 'KV Cache' in chapter_meta.get('og:description', '') and '任务契约' in a2a_meta.get('og:description', ''))
    # Jekyll may normalize the source offset to the build timezone. Compare the
    # instant from the original front matter, not its equivalent string form.
    check('updated publication metadata preserves the requested instant', datetime.fromisoformat(a2a_meta.get('article:published_time', '').replace('Z', '+00:00')) == datetime(2026, 10, 20, 1, 45, tzinfo=timezone(timedelta(hours=-4))))
    check('canonical sharing URL has one path separator', chapter_meta.get('og:url') == 'https://a1024053774.github.io/ai-agent/chapter-02/')
    bodies = chapter.all(cls='post-content')
    body = bodies[0] if bodies else Element()
    check('chapter 2 is published inside the AI Agent book', bool(bodies) and chapter_url in [a.attrs.get('href') for a in document('/ai-agent/').all(cls='book-chapter-link')])
    check('chapter 1 next link reaches chapter 2', chapter_url in [a.attrs.get('href') for p in document('/ai-agent/chapter-01/').all(cls='chapter-pagination') for a in p.all('a')])
    check('chapter 2 previous link reaches chapter 1', '/ai-agent/chapter-01/' in [a.attrs.get('href') for p in chapter.all(cls='chapter-pagination') for a in p.all('a')])
    check('homepage keeps one book entry without a chapter entry', [a.attrs.get('href') for a in document('/').all(attr='data-home-card')].count('/ai-agent/') == 1 and chapter_url not in [a.attrs.get('href') for a in document('/').all(attr='data-home-card')])
    check('all seventeen source figures render with alternative text', len(body.all('img')) == 17 and all(i.attrs.get('alt', '').strip() for i in body.all('img')))
    check('source attention table has a header and three data rows', [len(t.all('tr')) for t in body.all('table')] == [4] and len(body.all('th')) == 3)
    code = body.all('pre')
    check('fourteen source code blocks and repaired XML example render', len(code) == 15)
    oracle = Path(__file__).with_name('fixtures').joinpath('context-core-loop.txt').read_text(encoding='utf-8').strip()
    check('complete API core loop remains one intact code block', any(c.text().strip() == oracle for c in code))
    check('status XML is code, not escaped prose or executable markup', any(c.text().strip().startswith('<agent_status>') and '</agent_status>' in c.text() for c in code) and not body.all('agent_status'))
    check('all ten source experiments remain readable', all(f'实验 2-{n} ' in body.text() for n in range(1, 11)))
    prose_after_quotes = ['这一定义最值得注意的不是符号本身', '不使用 KV Cache 时', '实验表明', 'Agent 状态栏技术有一个实用的优点', '当你问“黑猫和白猫各有多少只”时']
    quoted_paragraphs = [p.text().strip() for q in body.all('blockquote') for p in q.all('p')]
    check('body explanations stay outside the preceding quoted examples', not any(text.startswith(prefix) for text in quoted_paragraphs for prefix in prose_after_quotes) and all(prefix in body.text() for prefix in prose_after_quotes))
    experiments = [h for h in body.all() if h.tag in ('h3', 'h4') and re.match(r'实验 2-\d+ ', h.text())]
    check('ten experiments have independent navigable headings', [h.attrs.get('id') for h in experiments] == [f'experiment-2-{n}' for n in range(1, 11)])
    experiment_quotes = [q for q in body.all('blockquote') if re.match(r'实验 2-\d+ ', q.text().strip())]
    check('each experiment has its own block without the reading tip', len(experiment_quotes) == 10)
    attention_lists = [listing for listing in body.all('ol') if '注意力储存池' in listing.text()]
    check('four attention patterns remain one continuously numbered list', len(attention_lists) == 1 and len([c for c in attention_lists[0].children if isinstance(c, Element) and c.tag == 'li']) == 4 and '背后的数学原因' in attention_lists[0].all('li')[0].text())
    check('nine questions retain continuous numbering without invented answers', [q.attrs.get('data-question') for q in body.all(cls='study-question')] == [str(i) for i in range(1, 10)] and not body.all(cls='study-answer'))
    check('all twelve Notion discussions and comments remain accessible', len(chapter.all(attr='data-notion-discussion-card')) == 12 and len(chapter.all(cls='notion-discussion-comment')) == 12)
    check('every discussion has a matching body annotation', all(body.all(attr='data-notion-discussion') and any(d.attrs.get('data-notion-discussion') == c.attrs.get('data-notion-discussion-card') for d in body.all(attr='data-notion-discussion')) for c in chapter.all(attr='data-notion-discussion-card')) and len(chapter.all(attr='data-notion-discussion-card')) == 12)
    a2a_bodies = a2a.all(cls='post-content')
    a2a_body = a2a_bodies[0] if a2a_bodies else Element()
    expected = [(body, a2a_url, ['task-card-state', 'independent-context']), (a2a_body, chapter_url, ['subagent-context-isolation', 'agent-status'])]
    for page, target, anchors in expected:
        notes = page.all(cls='reading-connection')
        check(f'{target} has an opening overview and two contextual references', len(notes) == 3 and all(n.all('p') and len(n.text().strip()) > 60 for n in notes) and [a.attrs.get('href') for n in notes for a in n.all('a')] == [target] + [target + '#' + a for a in anchors])
    placements = [(body, 'agent-status', 'h2', a2a_url + '#task-card-state'), (body, 'subagent-context-isolation', 'h3', a2a_url + '#independent-context'), (a2a_body, 'independent-context', 'h2', chapter_url + '#subagent-context-isolation'), (a2a_body, 'task-card-state', 'h3', chapter_url + '#agent-status')]
    for page, section, level, href in placements:
        current_section = None
        located = False
        for node in page.all():
            if node.tag == level:
                current_section = node.attrs.get('id')
            if node.tag == 'a' and node.attrs.get('href') == href:
                located = current_section == section
        check(f'reference appears beside {section}', located)
    check('literal timestamp template survives Liquid rendering', '{{now}}' in body.text())
    text = body.text()
    for c in code:
        text = text.replace(c.text(), '')
    check('no export delimiters or broken inline formatting leak into prose', not any(x in text for x in ['```', '{color=', 'notion-file-block://', '**', '\\`', '<empty-block']))
    broken = []
    for page, url in [(body, chapter_url), (a2a, a2a_url)]:
        for a in page.all('a'):
            href = a.attrs.get('href', '')
            link = urlsplit(href)
            if link.scheme or link.netloc or not href:
                continue
            path = unquote(link.path or url).strip('/')
            file = site / path
            if not file.suffix:
                file /= 'index.html'
            if not file.exists():
                broken.append(href)
            elif link.fragment and file.suffix == '.html':
                ids = [n.attrs.get('id') for n in Document(file.read_text(encoding='utf-8')).root.all()]
                if unquote(link.fragment) not in ids:
                    broken.append(href)
    check('references resolve to real pages and section anchors', not broken)
    return {'status': 'PASS' if all(r['status'] == 'PASS' for r in results) else 'FAIL', 'checks': results, 'broken_links': broken}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path, default=Path('_site'))
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = check_site(args.site)
    output = json.dumps(report, ensure_ascii=False, indent=2)
    if args.report:
        args.report.write_text(output + '\n', encoding='utf-8')
    print(output)
    raise SystemExit(0 if report['status'] == 'PASS' else 1)
