import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { measureReadingContrast } from './browser-reading-contrast.mjs';

const rules = JSON.parse(readFileSync(new URL('./reading.rules.json', import.meta.url)));
const homeSeries = JSON.parse(readFileSync(new URL('./home_series.rules.json', import.meta.url)));
const supported = ['directory', 'code', 'tables', 'theme', 'viewport'];
expect(Object.keys(rules).sort()).toEqual(['articles', 'books', 'overflowTolerancePx', 'rules']);
expect(rules.rules.length).toBeGreaterThan(0);
for (const name of rules.rules) expect(supported, `Unknown reading rule: ${name}`).toContain(name);
expect(new Set(rules.rules).size).toBe(rules.rules.length);
expect(rules.overflowTolerancePx).toBeGreaterThanOrEqual(0);
expect(rules.overflowTolerancePx).toBeLessThanOrEqual(2);
expect(rules.books.length).toBeGreaterThan(0);
expect(Array.isArray(rules.articles)).toBe(true);
for (const article of rules.articles) expect(Object.keys(article).sort()).toEqual(['comments', 'source', 'url']);

function articleSourceExpectations(file) {
  const source = readFileSync(file, 'utf8');
  const body = source.replace(/^---\r?\n[\s\S]*?^---\r?\n/, '');
  const visibleLines = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) visibleLines.push(line);
  }
  expect(inFence, `${file} must close every code fence`).toBe(false);
  const visibleBody = visibleLines.join('\n');
  const codeBlocks = body.split('\n').filter(line => line.startsWith('```')).length / 2;
  const images = (visibleBody.match(/^!\[/gm) || []).length;
  const notes = (visibleBody.match(/^<aside class="article-note" markdown="1">$/gm) || []).length;
  expect(codeBlocks, `${file} must contain code samples`).toBeGreaterThan(0);
  expect(images, `${file} must contain its exported images`).toBeGreaterThan(0);
  return {
    codeBlocks,
    images,
    notes,
    headings: [2, 3, 4, 5].map(level => (visibleBody.match(new RegExp(`^#{${level}} `, 'gm')) || []).length)
  };
}

test('configured browser profile matches the measured environment', async ({ page, browser, browserName, isMobile }, info) => {
  await goto(page, rules.books[0].hub);
  const environment = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    width: innerWidth,
    height: innerHeight,
    touchPoints: navigator.maxTouchPoints,
    coarsePointer: matchMedia('(pointer: coarse)').matches
  }));
  await info.attach('browser environment', { body: JSON.stringify({ project: info.project.name, engine: browserName, version: browser.version(), ...environment }, null, 2), contentType: 'application/json' });
  expect(environment.width).toBe(page.viewportSize().width);
  if (info.project.name.startsWith('phone-')) {
    expect(isMobile).toBe(true);
    expect(environment.userAgent).toMatch(/iPhone|Android/);
    expect(environment.width).toBeLessThan(600);
    expect(environment.coarsePointer).toBe(true);
    // Desktop WebKit reports zero hardware touch points; verify the emulated input instead.
    await page.locator('.navbar-toggle').tap();
    await expect(page.locator('.navbar-toggle')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.navbar-toggle').tap();
    await expect(page.locator('.navbar-toggle')).toHaveAttribute('aria-expanded', 'false');
  } else {
    expect(isMobile).toBe(false);
    expect(environment.userAgent).not.toMatch(/iPhone|Android/);
  }
});

test('homepage series consolidate articles and preserve responsive navigation', async ({ page, isMobile }, info) => {
  await goto(page, '/');
  const series = page.locator('.home-series__item');
  await expect(series).toHaveCount(homeSeries.series.length);
  expect(await series.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-series-tag')))).toEqual(homeSeries.series.map(item => item.tag));

  const boxes = await series.evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  expect(boxes.every(box => box.width > 0 && box.height > 0)).toBe(true);
  if (isMobile) {
    expect(boxes[0].x).toBeCloseTo(boxes[1].x, 0);
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
  } else {
    expect(boxes[0].y).toBeCloseTo(boxes[1].y, 0);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  }

  const newest = page.locator('[data-home-card]').nth(0);
  const followed = page.locator('[data-home-card]').nth(1);
  await expect(newest).toHaveAttribute('href', homeSeries.latest[0].href);
  await expect(newest.locator('h3')).toHaveText(homeSeries.latest[0].title);
  await expect(newest.locator('.home-card__topline span').last()).toHaveText(homeSeries.latest[0].published);
  await expect(followed).toHaveAttribute('href', homeSeries.latest[1].href);
  await expect(followed.locator('h3')).toHaveText(homeSeries.latest[1].title);

  for (const [index, item] of homeSeries.series.entries()) {
    await page.goto(`/tags/?series=${index}#` + encodeURIComponent(item.tag));
    await expect(page.locator(`[data-tag-filter="${item.tag}"]`)).toHaveClass(/is-active/);
    await expect(page.locator('[data-tag-post]:not(.is-hidden)')).toHaveCount(item.count);
  }

  await page.goto('/tags/');
  await page.locator('[data-tag-filter="编程语言"]').click();
  const programmingCards = page.locator('[data-tag-post]:not(.is-hidden)');
  expect(await programmingCards.evaluateAll(nodes => nodes.map(node => ({
    href: node.querySelector('.tag-lab__card-title')?.getAttribute('href'),
    published: node.querySelector('.tag-lab__card-meta span')?.textContent?.trim(),
  })))).toEqual(homeSeries.tagPublication);

  await page.goto('/');
  for (const mode of ['light', 'dark']) await setTheme(page, mode, isMobile);
  await info.attach('consolidated series', { body: await page.locator('.home-series').screenshot(), contentType: 'image/png' });
});

async function goto(page, url) {
  const response = await page.goto(url);
  expect([200, 304], url).toContain(response?.status());
  await expect(page.locator('#darkmode-toggle')).toHaveAttribute('aria-label', /^切换到/);
}

async function setTheme(page, mode, isMobile) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  if (await page.locator('html').getAttribute('data-theme') !== mode) {
    const menu = page.locator('.navbar-toggle');
    if (isMobile && await menu.getAttribute('aria-expanded') !== 'true') await menu.tap();
    const toggle = page.locator('#darkmode-toggle');
    if (isMobile) await toggle.tap();
    else await toggle.click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
  await expect(page.locator('#darkmode-toggle')).toHaveAttribute('aria-label', mode === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  if (isMobile) await expect(page.locator('.navbar-toggle')).toHaveAttribute('aria-expanded', 'false');
  // Wait for the actual CSS transition, without disabling it or sleeping a fixed time.
  await expect.poll(() => page.locator('body').evaluate(body => body.getAnimations({ subtree: true }).filter(a => a.constructor.name === 'CSSTransition' && a.playState === 'running').length)).toBe(0);
}

async function scrollRegion(region, keyboard) {
  const size = await region.evaluate(node => ({ width: node.clientWidth, content: node.scrollWidth, overflow: getComputedStyle(node).overflowX }));
  expect(size.width).toBeGreaterThan(0);
  if (size.content <= size.width + rules.overflowTolerancePx) return;
  expect(['auto', 'scroll'], 'Overflowing content needs native horizontal scrolling').toContain(size.overflow);
  await region.scrollIntoViewIfNeeded();
  await region.focus();
  await expect(region).toBeFocused();
  // Desktop keyboard input is a real event. Mobile WebKit does not emulate an iOS hardware keyboard.
  if (keyboard) {
    await region.press('ArrowRight');
    await expect.poll(() => region.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  }
  // Check the full layout range separately. This is not evidence of an iOS swipe.
  await region.evaluate(node => node.scrollTo({ left: node.scrollWidth, behavior: 'instant' }));
  await expect.poll(() => region.evaluate(node => node.scrollWidth - node.clientWidth - node.scrollLeft)).toBeLessThanOrEqual(rules.overflowTolerancePx);
  if (keyboard) {
    const end = await region.evaluate(node => node.scrollLeft);
    await region.press('ArrowLeft');
    await expect.poll(() => region.evaluate(node => node.scrollLeft)).toBeLessThan(end);
  }
}

async function viewport(page) {
  const measured = await page.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
    viewport: document.querySelector('meta[name="viewport"]')?.content,
    clipped: [...document.querySelectorAll('.post-content > *, .book-content > *, .chapter-directory-mobile, .chapter-pagination')]
      .filter(node => {
        const box = node.getBoundingClientRect();
        return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
      }).map(node => node.tagName + '.' + node.className)
  }));
  expect(measured.viewport).toContain('width=device-width');
  expect(measured.viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\D|$)/);
  expect(measured.clipped, 'Reading blocks must fit even if the site clips decorative overflow').toEqual([]);
  expect(measured.document).toBeLessThanOrEqual(measured.width + rules.overflowTolerancePx);
}

for (const book of rules.books) {
  expect(Object.keys(book).sort()).toEqual(['chapters', 'comments', 'hub', 'minimumChapters']);
  // The collection declares the public pages. New chapter files enter the same rules automatically.
  // This collection uses the repository's /:path/ chapter permalink contract.
  const chapters = readdirSync(book.chapters, { recursive: true }).filter(name => name.endsWith('.md')).map(name => {
    const file = join(book.chapters, name);
    const source = readFileSync(file, 'utf8');
    const order = Number(source.match(/^order:\s*(\d+)\s*$/m)?.[1]);
    expect(order, file).toBeGreaterThan(0);
    const explicit = source.match(/^permalink:\s*(\/\S+)\s*$/m)?.[1];
    return { order, url: explicit || '/' + relative('_chapters', file).replace(/\.md$/, '/').split('\\').join('/') };
  }).sort((a, b) => a.order - b.order);
  expect(chapters.length, book.hub).toBeGreaterThanOrEqual(book.minimumChapters);
  const urls = chapters.map(chapter => chapter.url);
  expect(new Set(urls).size).toBe(urls.length);
  expect(new Set(chapters.map(chapter => chapter.order)).size).toBe(chapters.length);

  test(`${book.hub} overflow sentinel remains readable`, async ({ page, isMobile }, info) => {
    const fixture = readFileSync(new URL('./fixtures/reading-overflow.html', import.meta.url), 'utf8');
    await page.route(`**${urls[0]}`, async route => {
      const response = await route.fetch();
      const html = await response.text();
      const opening = /<div class="post-content[^"]*">/;
      expect(html).toMatch(opening);
      await route.fulfill({ response, body: html.replace(opening, match => match + fixture) });
    });
    await goto(page, urls[0]);
    await expect(page.locator('[data-reading-overflow] pre')).toHaveAttribute('role', 'region');
    for (const region of [page.locator('[data-reading-overflow] pre'), page.locator('[data-reading-overflow] table').locator('..')]) {
      expect(await region.evaluate(node => node.scrollWidth - node.clientWidth), 'The sentinel must exercise real overflow').toBeGreaterThan(100);
      await scrollRegion(region, !isMobile);
    }
    await info.attach('overflow sentinel', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test(`${book.hub} overview opens every chapter`, async ({ page, isMobile }) => {
    await goto(page, book.hub);
    await expect(page.locator('.book-chapter-link')).toHaveCount(chapters.length);
    expect(await page.locator('.book-chapter-link').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(urls);
    for (const url of urls) {
      const link = page.locator(`.book-chapter-link[href="${url}"]`);
      if (isMobile) await link.tap();
      else await link.click();
      await expect(page).toHaveURL(new URL(url, page.url()).href);
      await expect(page.locator('.post-content')).toBeVisible();
      await page.locator(`.chapter-breadcrumb a[href="${book.hub}"]`).click();
      await expect(page).toHaveURL(new URL(book.hub, page.url()).href);
    }
    if (chapters.length >= 3) {
      await page.locator(`.book-chapter-link[href="${urls[1]}"]`).click();
      for (const [selector, destination] of [
        ['a[rel="next"]', urls[2]],
        ['a[rel="prev"]', urls[1]],
        [`a[href="${book.hub}"]`, book.hub]
      ]) {
        await page.locator('.chapter-pagination').locator(selector).click();
        await expect(page).toHaveURL(new URL(destination, page.url()).href);
      }
    }
    if (rules.rules.includes('viewport')) await viewport(page);
    if (!book.comments) await expect(page.locator('[data-comments-root], [data-notion-discussion-card]')).toHaveCount(0);
  });

  for (const [index, chapter] of chapters.entries()) {
    test(`${chapter.url} reading rules`, async ({ page, isMobile }, info) => {
      await goto(page, chapter.url);
      const body = page.locator('.post-content');
      await expect(body).toBeVisible();
      if (!book.comments) await expect(page.locator('[data-comments-root], [data-notion-discussion-card]')).toHaveCount(0);
      for (const mode of ['light', 'dark']) {
        await setTheme(page, mode, isMobile);
        if (rules.rules.includes('theme')) await test.step(`theme: ${mode} paints and survives reload`, async () => {
          const painted = await body.evaluate(node => ({
            text: getComputedStyle(node).color,
            surface: getComputedStyle(document.body).backgroundColor,
            scheme: getComputedStyle(document.documentElement).colorScheme
          }));
          expect(painted.scheme).toBe(mode);
          // Independent visual contract: light paper is light, dark paper is dark.
          const rgb = painted.surface.match(/[\d.]+/g).slice(0, 3).map(Number);
          const brightness = rgb.reduce((a, b) => a + b) / 3;
          if (mode === 'light') expect(brightness).toBeGreaterThan(180);
          else expect(brightness).toBeLessThan(80);
          expect(painted.text).not.toBe(painted.surface);
          if (isMobile) await page.locator('.chapter-directory-mobile summary').tap();
          // Revealing a closed details element can start inherited color transitions.
          await expect.poll(() => page.locator('body').evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.constructor.name === 'CSSTransition' && a.playState === 'running').length)).toBe(0);
          const contrast = await measureReadingContrast({ playwright: page });
          await info.attach(`contrast-${mode}`, { body: JSON.stringify(contrast, null, 2), contentType: 'application/json' });
          expect([...contrast.headers, ...contrast.links, ...contrast.content].filter(item => !item.passed), 'Visible reading text must meet the contrast minimum').toEqual([]);
          if (isMobile) await page.locator('.chapter-directory-mobile summary').tap();
          await page.reload();
          await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
          await expect(page.locator('#darkmode-toggle')).toHaveAttribute('aria-label', mode === 'dark' ? '切换到浅色模式' : '切换到深色模式');
        });

        if (rules.rules.includes('directory')) await test.step(`directory: ${mode}`, async () => {
          const directory = page.locator(isMobile ? '.chapter-directory-mobile .chapter-directory' : '.side-catalog .chapter-directory');
          await expect(directory).toBeVisible();
          if (isMobile) await directory.locator('summary').tap();
          expect(await directory.locator('ol a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(urls);
          await expect(directory.locator('[aria-current="page"]')).toHaveAttribute('href', chapter.url);
          const destination = urls[(index + 1) % urls.length];
          const link = directory.locator(`a[href="${destination}"]`);
          if (isMobile) await link.tap();
          else await link.click();
          await expect(page).toHaveURL(new URL(destination, page.url()).href);
          await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
          await goto(page, chapter.url);
          const expected = [urls[index - 1], book.hub, urls[index + 1]].filter(Boolean);
          expect(await page.locator('.chapter-pagination a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(expected);
        });

        if (rules.rules.includes('code')) await test.step(`code: ${mode}`, async () => {
          const samples = body.locator('pre');
          expect(await samples.count()).toBeGreaterThan(0);
          await expect(body.locator('.code-window__header')).toHaveCount(await samples.count());
          for (const pre of await samples.all()) {
            await expect(pre).toBeVisible();
            expect(await pre.locator('code').textContent()).not.toBe('');
            const vertical = await pre.evaluate(node => ({
              height: node.clientHeight,
              content: node.scrollHeight,
              clippedByWindow: node.getBoundingClientRect().bottom > node.closest('.code-window').getBoundingClientRect().bottom + 1
            }));
            expect(vertical.content).toBeLessThanOrEqual(vertical.height + rules.overflowTolerancePx);
            expect(vertical.clippedByWindow).toBe(false);
            await scrollRegion(pre, !isMobile);
          }
        });

        if (rules.rules.includes('tables')) await test.step(`tables: ${mode}`, async () => {
          for (const table of await body.locator('table').all()) {
            expect(await table.locator('th').count()).toBeGreaterThan(0);
            const region = table.locator('..');
            await expect(region).toHaveClass(/table-responsive/);
            await expect(table).toBeVisible();
            await scrollRegion(region, !isMobile);
            const rows = await table.locator('tr').evaluateAll(nodes => nodes.map(row => ({
              columns: row.children.length,
              visible: [...row.children].every(cell => getComputedStyle(cell).visibility === 'visible' && cell.getBoundingClientRect().width > 0)
            })));
            expect(rows.every(row => row.columns === rows[0].columns && row.visible)).toBe(true);
          }
        });
        if (rules.rules.includes('viewport')) await test.step(`viewport: ${mode}`, () => viewport(page));
      }
      await page.screenshot({ path: info.outputPath('reading.png') });
      await info.attach('reading screenshot', { path: info.outputPath('reading.png'), contentType: 'image/png' });
    });
  }
}

for (const article of rules.articles) {
  const expected = articleSourceExpectations(article.source);

  test(`${article.url} article contract`, async ({ page, isMobile }, info) => {
    test.slow();
    await goto(page, article.url);
    const body = page.locator('.post-content');
    await expect(body).toBeVisible();

    await expect(body.locator('h1')).toHaveCount(0);
    for (const [offset, level] of [2, 3, 4, 5].entries()) {
      await expect(body.locator(`h${level}`)).toHaveCount(expected.headings[offset]);
    }

    const samples = body.locator('pre');
    await expect(samples).toHaveCount(expected.codeBlocks);
    await expect(body.locator('.code-window__header')).toHaveCount(expected.codeBlocks);
    const codeMetrics = await samples.evaluateAll(nodes => nodes.map(node => ({
      text: node.querySelector('code')?.textContent || '',
      width: node.clientWidth,
      content: node.scrollWidth,
      height: node.clientHeight,
      verticalContent: node.scrollHeight,
      clippedByWindow: node.getBoundingClientRect().bottom > node.closest('.code-window').getBoundingClientRect().bottom + 1
    })));
    expect(codeMetrics.every(item => item.text.length > 0)).toBe(true);
    expect(codeMetrics.every(item => item.verticalContent <= item.height + rules.overflowTolerancePx)).toBe(true);
    expect(codeMetrics.every(item => !item.clippedByWindow)).toBe(true);
    const overflowing = codeMetrics.map((item, index) => ({ ...item, index })).filter(item => item.content > item.width + rules.overflowTolerancePx);
    expect(overflowing.length, 'At least one exported code sample must exercise horizontal scrolling').toBeGreaterThan(0);

    const images = body.locator('img');
    await expect(images).toHaveCount(expected.images);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    }
    await expect(body.locator('.article-note')).toHaveCount(expected.notes);
    expect((await body.locator('.article-note').allTextContents()).every(text => !text.includes('```'))).toBe(true);

    if (!article.comments) await expect(page.locator('[data-comments-root], [data-notion-discussion-card]')).toHaveCount(0);
    if (rules.rules.includes('viewport')) await viewport(page);

    for (const mode of ['light', 'dark']) {
      await setTheme(page, mode, isMobile);
      if (rules.rules.includes('theme')) await test.step(`theme: ${mode} paints and survives reload`, async () => {
        const painted = await body.evaluate(node => ({
          text: getComputedStyle(node).color,
          surface: getComputedStyle(document.body).backgroundColor,
          scheme: getComputedStyle(document.documentElement).colorScheme
        }));
        expect(painted.scheme).toBe(mode);
        const rgb = painted.surface.match(/[\d.]+/g).slice(0, 3).map(Number);
        const brightness = rgb.reduce((a, b) => a + b) / 3;
        if (mode === 'light') expect(brightness).toBeGreaterThan(180);
        else expect(brightness).toBeLessThan(80);
        expect(painted.text).not.toBe(painted.surface);
        await expect.poll(() => page.locator('body').evaluate(node => node.getAnimations({ subtree: true }).filter(a => a.constructor.name === 'CSSTransition' && a.playState === 'running').length)).toBe(0);
        const contrast = await measureReadingContrast({ playwright: page });
        await info.attach(`contrast-${mode}`, { body: JSON.stringify(contrast, null, 2), contentType: 'application/json' });
        expect([...contrast.headers, ...contrast.links, ...contrast.content].filter(item => !item.passed), 'Visible reading text must meet the contrast minimum').toEqual([]);
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
        await expect(page.locator('#darkmode-toggle')).toHaveAttribute('aria-label', mode === 'dark' ? '切换到浅色模式' : '切换到深色模式');
      });

      if (rules.rules.includes('code')) await test.step(`code: ${mode}`, async () => {
        for (const item of [overflowing[0], overflowing.at(-1)]) {
          await scrollRegion(samples.nth(item.index), !isMobile);
        }
      });
      if (rules.rules.includes('viewport')) await test.step(`viewport: ${mode}`, () => viewport(page));
    }

    await page.screenshot({ path: info.outputPath('reading.png') });
    await info.attach('reading screenshot', { path: info.outputPath('reading.png'), contentType: 'image/png' });
  });
}
