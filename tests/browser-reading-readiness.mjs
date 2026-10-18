// Run in cua_repl with a tab already on the local chapter 2 page.
// Source oracle: 13 formulas, 14 fenced samples plus the repaired XML sample,
// and 12 discussions in the original Notion snapshot.
export async function checkChapterReadiness(tab) {
  const cdp = await tab.capabilities.get('cdp');
  let cursor = (await cdp.readEvents({ methods: ['Fetch.requestPaused'] })).cursor;
  let held;
  let report;
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*mathjax*', resourceType: 'Script', requestStage: 'Request' }] });
  try {
    await cdp.send('Page.reload', {});
    for (let i = 0; i < 5 && !held; i += 1) {
      const batch = await cdp.readEvents({ afterSequence: cursor, methods: ['Fetch.requestPaused'], timeoutMs: 5000 });
      cursor = batch.cursor;
      held = batch.events.find(e => e.params?.resourceType === 'Script' && e.params?.request?.url.includes('mathjax'));
    }
    if (!held) throw new Error('The math request was not paused; the delay scenario was not exercised.');
    await tab.playwright.locator('#darkmode-toggle[aria-label^="切换到"]').waitFor({ state: 'visible', timeoutMs: 5000 });
    const before = await tab.playwright.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await tab.playwright.locator('#darkmode-toggle').press(' ');
    const middle = await tab.playwright.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await tab.playwright.locator('#darkmode-toggle').press('Enter');
    report = await tab.playwright.evaluate(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      codeHeaders: document.querySelectorAll('.post-content .code-window__header').length,
      annotations: document.querySelectorAll('[data-notion-discussion][role="button"]').length
    }));
    report.themeRoundTrip = before !== middle && before === report.theme;
    await tab.playwright.locator('[data-notion-discussion="notion-discussion-12"]').press('Enter');
    report.discussionOpens = await tab.playwright.evaluate(() => !document.querySelector('#notion-discussions-panel').hidden);
    await tab.playwright.locator('[data-notion-discussions-close]').press('Escape');
    report.discussionCloses = await tab.playwright.evaluate(() => document.querySelector('#notion-discussions-panel').hidden && document.activeElement?.getAttribute('data-notion-discussion') === 'notion-discussion-12');
  } finally {
    try {
      if (held) await cdp.send('Fetch.continueRequest', { requestId: held.params.requestId });
    } finally {
      await cdp.send('Fetch.enable', { patterns: [] });
    }
  }
  await tab.playwright.locator('.post-content mjx-container').nth(12).waitFor({ state: 'attached', timeoutMs: 20000 });
  report.math = await tab.playwright.evaluate(() => ({
    formulas: document.querySelectorAll('.post-content mjx-container').length,
    errors: document.querySelectorAll('mjx-merror').length,
    currencyProseInMath: [...document.querySelectorAll('.post-content mjx-container')].some(n => /计.*费|就.*省.*了/s.test(n.textContent)),
    pricesRemainText: ['$0.05', '$180', '$150', '$30'].every(value => document.querySelector('.post-content').textContent.includes(value))
  }));
  report.status = report.themeRoundTrip && report.codeHeaders === 15 && report.annotations === 12 && report.discussionOpens && report.discussionCloses && report.math.formulas === 13 && report.math.errors === 0 && !report.math.currencyProseInMath && report.math.pricesRemainText ? 'PASS' : 'FAIL';
  if (report.status !== 'PASS') throw new Error(JSON.stringify(report));
  return report;
}
