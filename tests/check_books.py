"""Check published HTML against the requested book structure and source material.

Run after Jekyll: python3 tests/check_books.py --site _site
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def all(self, tag=None, cls=None, attr=None):
        found = []
        for child in self.children:
            if not isinstance(child, Element):
                continue
            if ((tag is None or child.tag == tag) and
                    (cls is None or cls in child.attrs.get('class', '').split()) and
                    (attr is None or attr in child.attrs)):
                found.append(child)
            found.extend(child.all(tag, cls, attr))
        return found

    def text(self):
        return ''.join(c.text() if isinstance(c, Element) else c for c in self.children)


class Document(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def check_site(site, chapter):
    results = []

    def check(name, condition):
        results.append({'check': name, 'status': 'PASS' if condition else 'FAIL'})

    def document(path):
        file = site / unquote(path).lstrip('/') / 'index.html'
        return Document(file.read_text(encoding='utf-8')).root if file.exists() else Element()

    home = document('/')
    cards = home.all(attr='data-home-card')
    hrefs = [c.attrs.get('href') for c in cards]
    check('homepage has exactly one Java book and one AI Agent book', hrefs.count('/java/') == 1 and hrefs.count('/ai-agent/') == 1)
    check('homepage contains no standalone chapters', not any(re.search(r'/2025/03/\d+/(?:Chapter|Phase)', str(h)) or 'AI-Agent-' in str(h) for h in hrefs))
    check('tag page does not load advertising into its hidden sidebar', not document('/tags/').all('ins', cls='adsbygoogle'))
    java = document('/java/')
    content = java.all(cls='book-content')
    check('Java book has Phase 01 and Phase 02 as level-one headings', bool(content) and [h.text().strip() for h in content[0].all('h1')] == ['Phase 01', 'Phase 02'])
    check('Java book links all nine nested chapters', len(java.all(cls='book-chapter-link')) == 9)
    check('AI Agent book links both published chapters', len(document('/ai-agent/').all(cls='book-chapter-link')) == 2)

    legacy = [f'/2025/03/{day:02d}/{slug}/' for day, slug in [(2, 'Chapter01'), (3, 'Phase01_Chapter01'), (4, 'Phase01_Chapter02'), (5, 'Phase01_Chapter03'), (6, 'Phase01_Chapter04'), (7, 'Phase01_Chapter05'), (8, 'Phase01_Chapter06'), (9, 'Phase01_Chapter07'), (10, 'Phase01_Chapter08'), (11, 'Phase02')]]
    legacy.append('/2026/10/15/AI-Agent-入门/')
    check('original standalone chapter routes are removed', not any((site / path.strip('/') / 'index.html').exists() for path in legacy))
    expected_paths = [f'/java/phase-01/chapter-{i:02d}/' for i in range(1, 9)] + ['/java/phase-02/chapter-01/', '/ai-agent/chapter-01/', '/ai-agent/chapter-02/']
    check('all eleven nested chapter pages exist', all((site / p.strip('/') / 'index.html').exists() for p in expected_paths))
    root = document(chapter)
    bodies = root.all(cls='post-content') or root.all(cls='post-container')
    body = bodies[0] if bodies else Element()
    code = body.all('pre')
    oracle = Path(__file__).with_name('fixtures').joinpath('react-loop.txt').read_text(encoding='utf-8').strip()
    check('complete ReAct pseudocode is one code block', any(c.text().strip() == oracle for c in code))
    check('all seven source code blocks render separately', len(code) == 7)
    check('no paragraph, heading or table is swallowed by code', all('下面再看' not in c.text() and 'Harness 工程：' not in c.text() and '```' not in c.text() for c in code))
    check('all six tables retain their source rows', [len(t.all('tr')) for t in body.all('table')] == [4, 6, 6, 10, 5, 5])
    questions = body.all(cls='study-question')
    check('ten questions have continuous numbering', [q.attrs.get('data-question') for q in questions] == [str(i) for i in range(1, 11)])
    check('six existing answers have separate answer blocks', [q.attrs.get('data-question') for q in questions if q.all(cls='study-answer')] == ['1', '2', '3', '7', '9', '10'])
    check('eight images retain descriptive alternative text', len(body.all('img')) == 8 and all(i.attrs.get('alt', '').strip() for i in body.all('img')))
    text = body.text()
    noncode = text
    for c in code:
        noncode = noncode.replace(c.text(), '')
    check('no exported Markdown or editor artifacts leak into prose', not any(x in noncode for x in ['```', '</span>', '<span', '[span_7]', '{color=', '<empty-block']))
    check('all eleven Notion discussions remain accessible', len(root.all(attr='data-notion-discussion-card')) == 11 and len(root.all(cls='notion-discussion-comment')) == 12)

    broken = []
    for page, page_path in [(java, '/java/'), (document('/ai-agent/'), '/ai-agent/'), (body, chapter)]:
        for link in page.all('a'):
            href = link.attrs.get('href', '')
            url = urlsplit(href)
            if url.scheme or url.netloc or href.startswith('javascript:'):
                if href.count('https://') > 1:
                    broken.append(href)
                continue
            if not url.path and not url.fragment:
                continue
            path = url.path or page_path
            file = site / unquote(path).lstrip('/')
            if file.suffix == '':
                file = file / 'index.html'
            if not file.exists():
                broken.append(href)
            elif url.fragment and file.suffix == '.html':
                target = Document(file.read_text(encoding='utf-8')).root
                if unquote(url.fragment) not in [e.attrs.get('id') for e in target.all()]:
                    broken.append(href)
    check('book/chapter links and citation anchors resolve', not broken)
    return {'status': 'PASS' if all(r['status'] == 'PASS' for r in results) else 'FAIL', 'checks': results, 'broken_links': broken}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', default='_site', type=Path)
    parser.add_argument('--chapter', default='/ai-agent/chapter-01/')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = check_site(args.site, args.chapter)
    output = json.dumps(report, ensure_ascii=False, indent=2)
    if args.report:
        args.report.write_text(output + '\n', encoding='utf-8')
    print(output)
    raise SystemExit(0 if report['status'] == 'PASS' else 1)
