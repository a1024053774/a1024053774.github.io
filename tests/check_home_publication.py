"""Render real templates with publication dates that conflict with modification dates.

Run: python3 tests/check_home_publication.py
Local Bundler override: --build-command 'bundle _2.4.22_ exec jekyll build'
"""
import argparse
import json
import shlex
import shutil
import subprocess
import tempfile
from pathlib import Path

from check_books import Document


def check_home(site):
    home = Document((site / 'index.html').read_text(encoding='utf-8')).root
    about = Document((site / 'about.html').read_text(encoding='utf-8')).root
    expected_urls = ['/new/', '/same-day/', '/book/']
    expected_dates = ['2050.01.03', '2050.01.03', '2040.01.01']
    cards = home.all(attr='data-home-card')
    rows = home.all(cls='home-row')
    return {
        'cards use publication order, including same-day times': [c.attrs['href'] for c in cards] == expected_urls,
        'list uses publication order': [r.attrs['href'] for r in rows] == expected_urls,
        'card dates show first publication': [c.all(cls='home-card__topline')[0].all('span')[-1].text() for c in cards] == expected_dates,
        'list dates show first publication': [r.all(cls='home-row__date')[0].text() for r in rows] == expected_dates,
        'featured article is the newest publication': [c.attrs['href'] for c in home.all(cls='home-featured__card')] == ['/new/'],
        'featured date shows first publication': any(e.text().strip() == 'FEATURED · 2050.01.03' for e in home.all(cls='home-section-head__meta')),
        'homepage summary shows first publication': home.all(cls='home-landing__stat')[-1].all('dd')[0].text() == '2050.01.03',
        'both about languages follow homepage order': [[a.attrs['href'] for a in listing.all('a')] for listing in about.all(cls='about-writing')] == [expected_urls, expected_urls],
    }


def run(build_command, report_dir):
    repo = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory(prefix='blog-publication-') as directory:
        source = Path(directory) / 'source'
        output = Path(directory) / 'site'
        for folder in ['_posts', '_chapters', '_plugins', '_layouts', '_includes']:
            (source / folder).mkdir(parents=True, exist_ok=True)
        for name in ['index.html', 'about.html', '_plugins/site_metadata_generator.rb', '_includes/comments.html']:
            shutil.copy2(repo / name, source / name)
        (source / '_layouts/default.html').write_text('{{ content }}', encoding='utf-8')
        (source / '_config.yml').write_text('future: true\ntimezone: UTC\ncollections:\n  chapters:\n    output: true\n', encoding='utf-8')
        posts = [
            ('2050-01-03-new.md', 'new', '2050-01-03 09:00:00 +0000', '2050-01-04T00:00:00Z', ''),
            ('2050-01-03-same-day.md', 'same-day', '2050-01-03 08:00:00 +0000', '2080-01-01T00:00:00Z', ''),
            ('2040-01-01-book.md', 'book', '2040-01-01 00:00:00 +0000', '2100-01-01T00:00:00Z', 'book: course\n'),
            ('2099-01-01-hidden.md', 'hidden', '2099-01-01 00:00:00 +0000', '2199-01-01T00:00:00Z', 'hidden: true\n'),
        ]
        for filename, slug, published, modified, extra in posts:
            (source / '_posts' / filename).write_text(f'---\ntitle: {slug}\npermalink: /{slug}/\ndate: {published}\nlast_modified_at: "{modified}"\nlast_modified_at_iso: "{modified}"\n{extra}---\nContent.\n', encoding='utf-8')
        reports = []
        for scenario, modified in [('conflicting dates', '2101-01-01'), ('chapter edited again', '2201-01-01')]:
            (source / '_chapters/chapter.md').write_text(f'---\ntitle: Chapter\nbook: course\ndate: 2040-01-01\nlast_modified_at: "{modified}T00:00:00Z"\nlast_modified_at_iso: "{modified}T00:00:00Z"\n---\n{scenario}\n', encoding='utf-8')
            result = subprocess.run(shlex.split(build_command) + ['--source', str(source), '--destination', str(output)], cwd=repo, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            (report_dir / f'{len(reports) + 1}-build.log').write_text(result.stdout, encoding='utf-8')
            if result.returncode:
                raise RuntimeError(result.stdout)
            shutil.copy2(output / 'index.html', report_dir / f'{len(reports) + 1}-home.html')
            checks = check_home(output)
            reports.append({'scenario': scenario, 'checks': checks})
        return {'status': 'PASS' if all(all(r['checks'].values()) for r in reports) else 'FAIL', 'scenarios': reports}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--build-command', default='bundle exec jekyll build')
    parser.add_argument('--report-dir', type=Path, required=True)
    args = parser.parse_args()
    args.report_dir.mkdir(parents=True, exist_ok=True)
    report = run(args.build_command, args.report_dir)
    text = json.dumps(report, ensure_ascii=False, indent=2)
    (args.report_dir / 'report.json').write_text(text + '\n', encoding='utf-8')
    print(text)
    raise SystemExit(0 if report['status'] == 'PASS' else 1)
