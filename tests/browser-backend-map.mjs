// Run through cua_repl. Set this tab's viewport to 1280×900 or 390×844 first.
// Pass a fresh, explicit tab handle; do not reuse a function that closes over an old tab.
export async function checkBackendMap(tab, origin) {
  const viewport = await tab.playwright.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  const narrow = viewport.width === 390 && viewport.height === 844;
  if (!narrow && !(viewport.width === 1280 && viewport.height === 900)) throw new Error('Use 1280×900 or 390×844 for this browser check.');
  const paths = ['/backend-map/', ...[1, 2, 3, 4].map(n => `/backend-map/chapter-0${n}/`)];
  // Counts come from the Notion source: 26 figures, 37 samples, 11 tables.
  const expected = [[1, 0, 0], [4, 3, 0], [5, 15, 4], [5, 12, 2], [11, 7, 5]];
  const reports = [];
  for (let i = 0; i < paths.length; i += 1) {
    const url = origin + paths[i];
    if (await tab.url() === url) await tab.reload();
    else await tab.goto(url);
    await tab.playwright.locator('#darkmode-toggle[aria-label^="切换到"]').waitFor({ state: 'attached', timeoutMs: 10000 });
    const before = await tab.playwright.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (narrow) await tab.playwright.locator('.navbar-toggle').press('Enter');
    await tab.playwright.locator('#darkmode-toggle').press(' ');
    const middle = await tab.playwright.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (narrow) await tab.playwright.locator('.navbar-toggle').press('Enter');
    await tab.playwright.locator('#darkmode-toggle').press('Enter');
    const page = await tab.playwright.evaluate(() => {
      const body = document.querySelector('.post-content, .book-content');
      return {
        path: location.pathname,
        title: document.querySelector('h1')?.textContent.trim(),
        theme: document.documentElement.getAttribute('data-theme'),
        images: body.querySelectorAll('img').length,
        code: body.querySelectorAll('.code-window__header').length,
        tables: body.querySelectorAll('table').length,
        comments: document.querySelectorAll('[data-comments-root]').length,
        annotations: document.querySelectorAll('[data-notion-discussion-card]').length,
        nativeThemeButton: document.querySelector('#darkmode-toggle').tagName === 'BUTTON',
        menuExpanded: document.querySelector('.navbar-toggle').getAttribute('aria-expanded'),
        overflow: document.documentElement.scrollWidth > innerWidth
      };
    });
    page.themeRoundTrip = before !== middle && before === page.theme;
    page.status = page.path === paths[i] && page.themeRoundTrip && page.nativeThemeButton && !page.overflow && page.comments === 0 && page.annotations === 0 && page.images === expected[i][0] && page.code === expected[i][1] && page.tables === expected[i][2] && (!narrow || page.menuExpanded === 'false') ? 'PASS' : 'FAIL';
    reports.push(page);
  }
  // The narrow chapter directory is a native details element, separate from the navbar.
  if (narrow) {
    await tab.playwright.locator('.chapter-directory-mobile summary').click();
    await tab.playwright.locator('.chapter-directory-mobile a[href="/backend-map/chapter-02/"]').click();
  } else {
    await tab.playwright.locator('.side-catalog .chapter-directory a[href="/backend-map/chapter-02/"]').click();
  }
  const journey = [await tab.url()];
  await tab.playwright.locator('.chapter-pagination a[rel="next"]').click();
  journey.push(await tab.url());
  await tab.playwright.locator('.chapter-pagination a[rel="prev"]').click();
  journey.push(await tab.url());
  await tab.playwright.locator('.chapter-pagination a[href="/backend-map/"]').click();
  journey.push(await tab.url());
  const expectedJourney = ['/backend-map/chapter-02/', '/backend-map/chapter-03/', '/backend-map/chapter-02/', '/backend-map/'].map(p => origin + p);
  const report = { viewport, pages: reports, journey, status: reports.every(r => r.status === 'PASS') && JSON.stringify(journey) === JSON.stringify(expectedJourney) ? 'PASS' : 'FAIL' };
  if (report.status !== 'PASS') throw new Error(JSON.stringify(report));
  return report;
}
