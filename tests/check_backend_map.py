"""Check the published backend book against the independent Notion snapshot."""
import argparse
import json
import re
import struct
from pathlib import Path
from urllib.parse import unquote, urlsplit

from check_books import Document, Element


def check_site(site):
    fixture = json.loads(Path(__file__).with_name('fixtures').joinpath('backend-map-source.json').read_text(encoding='utf-8'))
    results = []

    def check(name, condition):
        results.append({'check': name, 'status': 'PASS' if condition else 'FAIL'})

    def document(url):
        path = site / url.strip('/') / 'index.html'
        return Document(path.read_text(encoding='utf-8')).root if path.exists() else Element()

    def text(node):
        return re.sub(r'\s+', ' ', node.text()).strip()

    urls = [f'/backend-map/chapter-{n:02d}/' for n in range(1, 5)]
    hub = document('/backend-map/')
    check('overview has the requested title', len(hub.all('h1')) == 1 and text(hub.all('h1')[0]) == '后端知识地图')
    check('overview has the four source chapters in order', [a.attrs.get('href') for a in hub.all(cls='book-chapter-link')] == urls)
    check('overview starts at chapter one', any(a.attrs.get('href') == urls[0] and '开始阅读' in a.text() for a in hub.all('a')))
    map_images = [i for content in hub.all(cls='book-content') for i in content.all('img')]
    overview = fixture['overview_image']
    check('overview retains the source map', len(map_images) == 1 and map_images[0].attrs.get('src') == '/img/in-post/2026-10-18-backend-map/overview.png' and map_images[0].attrs.get('width') == str(overview['width']) and map_images[0].attrs.get('height') == str(overview['height']) and bool(map_images[0].attrs.get('alt', '').strip()))
    home = document('/')
    check('homepage series links the backend overview once', [a.attrs.get('href') for a in home.all(cls='home-series__item')].count('/backend-map/') == 1)
    for cls, attr in [(None, 'data-home-card'), ('home-row', None)]:
        links = [a.attrs.get('href') for a in home.all(cls=cls, attr=attr)]
        check(f'homepage {attr or cls} has one book and no loose chapter', links.count('/backend-map/') == 1 and not any(u in links for u in urls))
    search = json.loads((site / 'search.json').read_text(encoding='utf-8'))
    check('search contains one backend book and no chapter result', [p['url'] for p in search].count('/backend-map/') == 1 and not any(p['url'] in urls for p in search))
    check('tag page includes the backend book', any(a.attrs.get('href') == '/backend-map/' for a in document('/tags/').all('a')))

    pages = [(hub, '/backend-map/')]
    for source, url in zip(fixture['chapters'], urls):
        page = document(url)
        bodies = page.all(cls='post-content')
        body = bodies[0] if bodies else Element()
        prefix = f'chapter {source["number"]}'
        check(f'{prefix} has its body and original chapter title', bool(bodies) and len(page.all('h1')) == 1 and text(page.all('h1')[0]) == source['title'] and not body.all('h1'))
        actual_heads = [{'level': int(n.tag[1]), 'text': text(n)} for n in body.all() if n.tag in ('h2', 'h3', 'h4')]
        check(f'{prefix} preserves source section hierarchy', actual_heads == source['headings'])
        check(f'{prefix} preserves every complete code sample in order', [p.text().strip() for p in body.all('pre')] == source['code'])
        rows = [[[text(cell) for cell in row.children if isinstance(cell, Element) and cell.tag in ('th', 'td')] for row in table.all('tr')] for table in body.all('table')]
        check(f'{prefix} preserves table headers and data cells', rows == source['tables'] and all(table.all('th') for table in body.all('table')))
        images = body.all('img')
        check(f'{prefix} preserves source images and their order', [i.attrs.get('src') for i in images] == ['/img/in-post/2026-10-18-backend-map/' + i['name'] for i in source['images']])
        assets_ok = len(images) == len(source['images'])
        for image, expected in zip(images, source['images']):
            path = site / image.attrs.get('src', '').lstrip('/')
            data = path.read_bytes() if path.is_file() else b''
            dimensions = struct.unpack('>II', data[16:24]) if data[:8] == b'\x89PNG\r\n\x1a\n' else None
            assets_ok = assets_ok and dimensions == (expected['width'], expected['height']) and bool(image.attrs.get('alt', '').strip()) and image.attrs.get('width') == str(expected['width']) and image.attrs.get('height') == str(expected['height'])
        check(f'{prefix} image resources have source dimensions and alt text', assets_ok)
        directories = page.all(cls='chapter-directory')
        check(f'{prefix} has the full book directory and current state', len(directories) == 2 and all([a.attrs.get('href') for a in d.all('a') if a.attrs.get('href') in urls] == urls and [a.attrs.get('href') for a in d.all('a') if a.attrs.get('aria-current') == 'page'] == [url] for d in directories))
        pagination = page.all(cls='chapter-pagination')
        expected_links = ([urls[source['number'] - 2]] if source['number'] > 1 else []) + ['/backend-map/'] + ([urls[source['number']]] if source['number'] < 4 else [])
        check(f'{prefix} previous/next/overview links follow chapter order', len(pagination) == 1 and [a.attrs.get('href') for a in pagination[0].all('a')] == expected_links)
        prose = body.text()
        for code in body.all('pre'):
            prose = prose.replace(code.text(), '')
        check(f'{prefix} has no leaked Notion or Markdown artifacts', not any(mark in prose for mark in ['```', '**', '{color=', 'notion-file-block://', '<empty-block', '<columns', '</span>']) and not body.all('column') and not body.all('callout'))
        pages.append((page, url))

    for page, url in pages:
        check(f'{url} has no comments or annotation panel', bool(page.all('html')) and not page.all(attr='data-comments-root') and not page.all(attr='data-notion-discussion-card'))
    old = document('/ai-agent/chapter-02/')
    check('existing AI comments and twelve annotations remain enabled', len(old.all(attr='data-comments-root')) == 1 and len(old.all(attr='data-notion-discussion-card')) == 12)
    first = document(urls[0])
    lists = [o for o in first.all('ol') if '为什么要用数据库' in o.text()]
    check('three database questions form one list with three answers', len(lists) == 1 and len([n for n in lists[0].children if isinstance(n, Element) and n.tag == 'li']) == 3 and len(lists[0].all('strong')) == 3)
    redis = document(urls[2])
    check('TTL sentinel values keep their negative signs', any('返回 -1：Key 存在' in text(p) for p in redis.all('li')) and any('返回 -2：Key 不存在' in text(p) for p in redis.all('li')))
    mq_code = [p.text().strip() for b in document(urls[3]).all(cls='post-content') for p in b.all('pre')]
    check('event example is valid JSON with the original field values', bool(mq_code) and json.loads(mq_code[0]) == {'event_id': 'evt-8b37c2', 'event_type': 'order.created', 'version': 1, 'order_id': 1001, 'user_id': 7, 'occurred_at': '2026-10-18T12:00:00Z'})

    broken = []
    for page, url in pages:
        for a in page.all('a'):
            link = urlsplit(a.attrs.get('href', ''))
            if link.scheme or link.netloc or not (link.path or link.fragment):
                continue
            path = site / unquote(link.path or url).lstrip('/')
            if not path.suffix:
                path /= 'index.html'
            if not path.exists() or (link.fragment and path.suffix == '.html' and unquote(link.fragment) not in [e.attrs.get('id') for e in Document(path.read_text(encoding='utf-8')).root.all()]):
                broken.append(a.attrs.get('href'))
    check('all overview and chapter local links resolve', not broken)
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
