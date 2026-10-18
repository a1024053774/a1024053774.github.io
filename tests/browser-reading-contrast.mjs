// Text-header reading scenario. W3C contrast minima: 4.5:1, or 3:1 for large text.
// https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
export async function measureReadingContrast(tab) {
  return tab.playwright.evaluate(() => {
    const rgba = value => {
      // color-mix(in srgb, ...) is serialized this way by current WebKit/Chromium.
      const srgb = value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
      if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
      const match = value.match(/^rgba?\(([^)]+)\)$/);
      if (!match) throw new Error('Unsupported measured color: ' + value);
      const channels = match[1].split(',').map(Number);
      return channels.length === 3 ? [...channels, 1] : channels;
    };
    const over = (front, back) => front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3]));
    const luminance = color => color.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    const contrast = (color, background) => {
      const a = luminance(over(color, background));
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const surface = node => {
      const parents = [];
      for (let p = node; p; p = p.parentElement) parents.push(p);
      let color = [255, 255, 255];
      for (const p of parents.reverse()) color = over(rgba(getComputedStyle(p).backgroundColor), color);
      return color;
    };
    const links = [...document.querySelectorAll('.side-catalog a, .chapter-directory-mobile a')].filter(a => !a.closest('details:not([open])') && a.getClientRects().length && getComputedStyle(a).visibility === 'visible').map(a => {
      const style = getComputedStyle(a);
      const ratio = contrast(rgba(style.color), surface(a));
      return { text: a.textContent.trim(), color: style.color, ratio, minimum: 4.5, passed: ratio >= 4.5 };
    });
    const header = document.querySelector('.intro-header.style-text');
    if (!header) throw new Error('Use a chapter with a text header.');
    const rect = header.getBoundingClientRect();
    const overlay = getComputedStyle(header, '::before').backgroundImage;
    if (!overlay.startsWith('linear-gradient(rgb')) throw new Error('Unsupported computed text-header overlay: ' + overlay);
    const stops = overlay.match(/rgba?\([^)]+\)/g).map(rgba);
    if (stops.length !== 2) throw new Error('Expected two text-header gradient stops.');
    const base = surface(header);
    const headers = [...header.querySelectorAll('h1, .subheading, .meta, .reading-time')].map(node => {
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const samples = [box.top, box.bottom].map(y => {
        const t = Math.min(1, Math.max(0, (y - rect.top) / rect.height));
        const stop = stops[0].map((v, i) => v + (stops[1][i] - v) * t);
        let back = over(stop, base);
        const chain = [];
        for (let p = node; p !== header; p = p.parentElement) chain.push(p);
        for (const p of chain.reverse()) back = over(rgba(getComputedStyle(p).backgroundColor), back);
        return contrast(rgba(style.color), back);
      });
      const size = Number(style.fontSize.replace('px', ''));
      const large = size >= 24 || (size >= 18.6667 && Number(style.fontWeight) >= 700);
      const minimum = large ? 3 : 4.5;
      const ratio = Math.min(...samples);
      return { text: node.textContent.trim(), ratio, minimum, passed: ratio >= minimum };
    });
    const content = [...document.querySelectorAll('.post-content p, .post-content th, .post-content td, .post-content pre code, .post-content pre span')]
      .filter(node => [...node.childNodes].some(child => child.nodeType === 3 && child.textContent.trim()))
      .map(node => {
        const style = getComputedStyle(node);
        const ratio = contrast(rgba(style.color), surface(node));
        return { text: node.textContent.trim().slice(0, 70), color: style.color, ratio, minimum: 4.5, passed: ratio >= 4.5 };
      });
    return { url: location.href, theme: document.documentElement.getAttribute('data-theme'), links, headers, content, status: [...links, ...headers, ...content].every(r => r.passed) && headers.length >= 3 && content.length > 0 ? 'PASS' : 'FAIL' };
  });
}
