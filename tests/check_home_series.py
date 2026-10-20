"""Check consolidated homepage series and their tag-backed article collections."""
import argparse
import json
import re
from pathlib import Path

from check_books import Document, Element


def check_site(site):
    contract = json.loads(Path(__file__).with_name('home_series.rules.json').read_text(encoding='utf-8'))
    results = []

    def check(name, condition):
        results.append({'check': name, 'status': 'PASS' if condition else 'FAIL'})

    def document(path):
        file = site / path.strip('/') / 'index.html'
        return Document(file.read_text(encoding='utf-8')).root if file.exists() else Element()

    def text(node):
        return re.sub(r'\s+', ' ', node.text()).strip()

    home = document('/')
    series_items = home.all(cls='home-series__item')
    actual_series = []
    for item in series_items:
        headings = item.all('h3')
        count = re.search(r'(\d+)\s*篇', text(item))
        actual_series.append({
            'tag': item.attrs.get('data-series-tag'),
            'title': text(headings[0]) if headings else None,
            'href': item.attrs.get('href'),
            'count': int(count.group(1)) if count else None,
        })

    check('homepage renders the four consolidated series in a stable order', actual_series == contract['series'])
    check('every consolidated series contains more than one public article', all(item['count'] > 1 for item in actual_series))
    check('series titles, tags and counts are unique where they should be', len({item['tag'] for item in actual_series}) == len(actual_series) and len({item['title'] for item in actual_series}) == len(actual_series))

    tags_page = document('/tags/')
    filters = {
        item.attrs.get('data-tag-filter'): item
        for item in tags_page.all(cls='tag-lab__chip')
        if item.attrs.get('data-tag-filter')
    }
    tag_checks = []
    for item in contract['series']:
        filter_button = filters.get(item['tag'])
        count = re.search(r'(\d+)', text(filter_button)) if filter_button else None
        tag_checks.append(bool(filter_button) and int(count.group(1)) == item['count'] and item['href'] == '/tags/#' + filter_button.attrs.get('id', ''))
    check('series links open matching tag collections with matching counts', all(tag_checks))

    programming_cards = []
    for card in tags_page.all(cls='tag-lab__card'):
        tags = (card.attrs.get('data-tags') or '').split('||')
        if '编程语言' not in tags:
            continue
        title_link = card.all(cls='tag-lab__card-title')[0]
        meta = card.all(cls='tag-lab__card-meta')[0]
        programming_cards.append({
            'href': title_link.attrs.get('href'),
            'published': text(meta.all('span')[0]),
            'data_published': card.attrs.get('data-published'),
        })
    check(
        'programming tag cards show and order by first publication',
        programming_cards == [
            {'href': item['href'], 'published': item['published'], 'data_published': item['published']}
            for item in contract['tagPublication']
        ],
    )

    cards = home.all(attr='data-home-card')
    actual_latest = [
        {
            'href': card.attrs.get('href'),
            'title': text(card.all('h3')[0]) if card.all('h3') else None,
            'published': text(card.all(cls='home-card__topline')[0].all('span')[-1]) if card.all(cls='home-card__topline') else None,
        }
        for card in cards[:2]
    ]
    check('A2A becomes the newest article and the AI Agent book follows it', actual_latest == contract['latest'])
    featured = home.all(cls='home-featured__card')
    check('featured article matches the newest card', len(featured) == 1 and featured[0].attrs.get('href') == contract['latest'][0]['href'])
    check('A2A keeps its existing public URL', bool(document('/2026/10/11/a2a-multi-agent-design/').all('h1')))

    return {
        'status': 'PASS' if all(item['status'] == 'PASS' for item in results) else 'FAIL',
        'checks': results,
        'actual_series': actual_series,
        'actual_latest': actual_latest,
    }


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
