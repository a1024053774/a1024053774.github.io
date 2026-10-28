---
layout:       post
title:        "用随机梯度下降来优化人生"
subtitle:     "李沐的 11 条建议，对照一张可以亲手跑 SGD 的地形图"
date:         2024-12-15 12:00:00 -0400
author:       "LuckyE"
header-style: text
catalog:      true
tags:
    - 随笔
    - 机器学习
    - 梯度下降
---

<style>
.sgd { --sgd-fg: #14211c; --sgd-muted: #55655e; --sgd-rule: #c9d3cd; --sgd-surface: #f8faf8; --sgd-accent: #0f6b5b; --sgd-path: #c2410c; --sgd-lo: #e3ebe6; --sgd-hi: #7fa89a; --sgd-contour: #0f4f43; color: var(--sgd-fg); }
html[data-theme="dark"] .sgd { --sgd-fg: #e4ece8; --sgd-muted: #93a49c; --sgd-rule: #2a3a34; --sgd-surface: #15201c; --sgd-accent: #4fc2a8; --sgd-path: #ff8f5a; --sgd-lo: #0f1b17; --sgd-hi: #2f6657; --sgd-contour: #7fd6c0; }
.sgd * { box-sizing: border-box; }
.sgd-stage { position: relative; border: 1px solid var(--sgd-rule); background: var(--sgd-surface); margin: 16px 0; }
.sgd canvas { display: block; width: 100%; height: auto; cursor: crosshair; touch-action: none; }
.sgd-legend { position: absolute; left: 8px; top: 6px; display: flex; gap: 12px; flex-wrap: wrap; font: 12px/1.4 ui-monospace, Menlo, monospace; background: var(--sgd-surface); opacity: .9; padding: 2px 8px; }
.sgd-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px 24px; align-items: end; margin-bottom: 14px; }
.sgd-ctl { display: grid; gap: 4px; min-width: 0; }
.sgd-ctl label { display: flex; justify-content: space-between; font-size: 14px; margin: 0; font-weight: 400; }
.sgd-ctl output { font: 600 14px ui-monospace, Menlo, monospace; color: var(--sgd-accent); }
.sgd input[type=range] { width: 100%; accent-color: var(--sgd-accent); }
.sgd-check { display: flex; gap: 8px; align-items: center; font-size: 15px; font-weight: 400; margin: 0; }
.sgd-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.sgd button { font: inherit; font-size: 14px; color: var(--sgd-fg); background: var(--sgd-surface); border: 1px solid var(--sgd-fg); padding: 6px 16px; cursor: pointer; }
.sgd button.sgd-primary { background: var(--sgd-accent); border-color: var(--sgd-accent); color: var(--sgd-surface); }
.sgd button:focus-visible, .sgd input:focus-visible { outline: 3px solid var(--sgd-accent); outline-offset: 2px; }
.sgd-out { font: 13px/1.6 ui-monospace, Menlo, monospace; color: var(--sgd-muted); min-height: 3.2em; }
.sgd-out b { color: var(--sgd-fg); }
.sgd-hint { font-size: 14px; color: var(--sgd-muted); }
.sgd-colh, .sgd-row { display: grid; grid-template-columns: 2.8rem minmax(0, 1fr) minmax(0, 1fr); gap: 8px 28px; }
.sgd-colh { font: 12px ui-monospace, Menlo, monospace; letter-spacing: .1em; color: var(--sgd-muted); padding-bottom: 8px; }
.sgd-row { padding: 20px 0; border-top: 1px solid var(--sgd-rule); }
.sgd-row:last-child { border-bottom: 1px solid var(--sgd-rule); }
.sgd-n { font: 600 14px/2 ui-monospace, Menlo, monospace; color: var(--sgd-accent); }
.sgd-life h4 { font-size: 18px; margin: 0 0 4px; line-height: 1.5; }
.sgd-life p, .sgd-algo p { color: var(--sgd-muted); font-size: 15px; margin: 0; }
.sgd-algo p b { color: var(--sgd-fg); font-weight: 500; }
.sgd-tag { display: block; font: 600 11px/1 ui-monospace, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--sgd-accent); margin-bottom: 6px; }
.sgd-try { margin-top: 8px; }
.sgd-try button { padding: 3px 12px; font-size: 13px; }
@media (max-width: 640px) {
  .sgd-row { grid-template-columns: 2.2rem minmax(0, 1fr); }
  .sgd-algo { grid-column: 2; }
  .sgd-colh { display: none; }
}
</style>

“目标不宜太简单。”“每一步，找到一个大致正确的方向，然后迈出一步。”这是李沐 2021 年那篇《用随机梯度下降来优化人生》里的话。文章把 SGD 的概念一条条对到人生上，一共 11 条。

我把这 11 条做成了一张可以动手的地形图：深色的地方损失低，你选起点、调步长和噪声，亲眼看 SGD 会走成什么样。

> 要点整理自李沐文章的转载与摘要（[腾讯频道转载](https://pd.qq.com/g/pd17321136/post/B_98af7367dfe606001441152191457501800X60)、[掘金摘要](https://juejin.cn/post/7381349596645507109)），没有读到原文全文。下面“SGD”一栏的算法解释是我补的，不是李沐的原话。

## 地形图实验

<div class="sgd" id="sgd-lab">
<div class="sgd-stage">
<canvas id="sgd-cv" width="920" height="613" aria-label="损失地形图，点击选择起点"></canvas>
<div class="sgd-legend"><span>● 起点</span><span>━ 路径</span><span>◆ 终点</span><span>等高线越密，坡越陡</span></div>
</div>
<div class="sgd-controls">
<div class="sgd-ctl"><label for="sgd-lr">步长（学习率）<output id="sgd-lrO"></output></label><input id="sgd-lr" type="range" min="0.02" max="2" step="0.01" value="0.8"></div>
<div class="sgd-ctl"><label for="sgd-noise">随机性（梯度噪声）<output id="sgd-noiseO"></output></label><input id="sgd-noise" type="range" min="0" max="1.5" step="0.05" value="0.6"></div>
<div class="sgd-ctl"><label for="sgd-steps">走多少步<output id="sgd-stepsO"></output></label><input id="sgd-steps" type="range" min="20" max="400" step="10" value="160"></div>
<label class="sgd-check" for="sgd-decay"><input id="sgd-decay" type="checkbox" checked> 步长随时间逐渐变小</label>
</div>
<div class="sgd-btns">
<button class="sgd-primary" id="sgd-run" type="button">再跑 5 次</button>
<button id="sgd-one" type="button">只跑 1 次</button>
<button id="sgd-clear" type="button">清除路径</button>
</div>
<div class="sgd-out" id="sgd-out" aria-live="polite"></div>
<p class="sgd-hint">点地形图上任意位置，换一个起点。已经画出的是同一起点跑 5 次的结果：起点、目标函数都一样，路径却各不相同。</p>
</div>

## 十一条，各对应算法里的什么

<div class="sgd">
<div class="sgd-colh"><span></span><span>人生</span><span>SGD</span></div>
<div class="sgd-row"><span class="sgd-n">01</span>
<div class="sgd-life"><h4>要有目标</h4><p>无论长短，是自己定的还是借来的，没有方向就谈不上优化。</p></div>
<div class="sgd-algo"><span class="sgd-tag">目标函数</span><p>先有 <b>损失函数</b>，才有梯度。地图上颜色越深的地方，损失越低。</p></div></div>
<div class="sgd-row"><span class="sgd-n">02</span>
<div class="sgd-life"><h4>目标要大</h4><p>可以从小目标开始，但目标太简单，一眼就看到了头。</p></div>
<div class="sgd-algo"><span class="sgd-tag">非凸</span><p>只有一个碗的 <b>凸函数</b> 没有悬念；有很多坑的地形，才值得走。</p></div></div>
<div class="sgd-row"><span class="sgd-n">03</span>
<div class="sgd-life"><h4>坚持走</h4><p>找一个大致可行的方向，迈一步，然后继续。</p></div>
<div class="sgd-algo"><span class="sgd-tag">更新规则</span><p><b>θ ← θ − η·g</b>。不必算出完美方向，估计的梯度就够用。</p></div></div>
<div class="sgd-row"><span class="sgd-n">04</span>
<div class="sgd-life"><h4>痛苦的卷</h4><p>改变会痛，但不改变就没有进步；太舒服可能是在原地。</p></div>
<div class="sgd-algo"><span class="sgd-tag">离开平地</span><p>梯度接近零，就停了。把起点放在一个坑底再跑：不加噪声，它永远不动。</p>
<div class="sgd-try"><button type="button" data-start="-1.8,-0.9" data-noise="0">试试：坑底、零噪声</button></div></div></div>
<div class="sgd-row"><span class="sgd-n">05</span>
<div class="sgd-life"><h4>可以躺平</h4><p>步子应该时大时小，适当休息，才能走得久。</p></div>
<div class="sgd-algo"><span class="sgd-tag">学习率</span><p>太大会在坑边来回跳，太小几乎走不动。<b>周期性调大调小</b>，也是常见的训练做法。</p>
<div class="sgd-try"><button type="button" data-lr="1.9" data-decay="0">试试：步长拉满、不衰减</button></div></div></div>
<div class="sgd-row"><span class="sgd-n">06</span>
<div class="sgd-life"><h4>四处看看</h4><p>方向来自对世界的认识。多探索，允许试错。</p></div>
<div class="sgd-algo"><span class="sgd-tag">随机</span><p>“随机”二字来自每次只看一小批数据，梯度带噪声，也因此有机会 <b>跳出小坑</b>。</p>
<div class="sgd-try"><button type="button" data-start="-2.5,-0.2" data-noise="0.9">试试：起点偏左、噪声调大</button></div></div></div>
<div class="sgd-row"><span class="sgd-n">07</span>
<div class="sgd-life"><h4>快也是慢</h4><p>前期进展太快，后期可能乏力。徘徊一阵不是坏事。</p></div>
<div class="sgd-algo"><span class="sgd-tag">过早收敛</span><p>早早落进最近的坑，就再也出不来。<b>前期步长大、乱走一会儿</b>，后期才有精细搜索的余地。</p></div></div>
<div class="sgd-row"><span class="sgd-n">08</span>
<div class="sgd-life"><h4>赢在起点</h4><p>起点影响很大。与其攀比，不如看清自己的起点和运气。</p></div>
<div class="sgd-algo"><span class="sgd-tag">初始化</span><p>在图上换几个起点：离好坑近的，几步就到；离得远的，可能先掉进别的坑。</p></div></div>
<div class="sgd-row"><span class="sgd-n">09</span>
<div class="sgd-life"><h4>很远也能到达</h4><p>起点再差，只要一直朝下坡走，结果会相近；偏了就重新调整。</p></div>
<div class="sgd-algo"><span class="sgd-tag">收敛</span><p>只要梯度方向大致对、步长合适，从不同起点都能到 <b>差不多低</b> 的地方。</p></div></div>
<div class="sgd-row"><span class="sgd-n">10</span>
<div class="sgd-life"><h4>独一无二</h4><p>目标可以相似，但每个人看到的世界不同，走出的路径也不同。</p></div>
<div class="sgd-algo"><span class="sgd-tag">多次运行</span><p>同一起点跑多次，每条轨迹的 <b>损失值相近，参数却各不相同</b>。点“再跑 5 次”对比。</p></div></div>
<div class="sgd-row"><span class="sgd-n">11</span>
<div class="sgd-life"><h4>简单最好</h4><p>目标复杂，反而是简单的办法最有效：盯住眼前，小步快跑。</p></div>
<div class="sgd-algo"><span class="sgd-tag">朴素的赢家</span><p>SGD 没有二阶信息、没有规划，却是训练大模型最常用的底子。</p></div></div>
</div>

## 类比不到的地方

人生没有一个公认的损失函数，也算不出梯度，只能在每次“走一步”之后凭感受估计。所以第 01 条最难：在优化之前，先要决定什么叫“更低”。

另外，算法里的噪声是零均值的，人生里的运气不是。第 08 条说的起点，在算法里可以重新初始化，在人生里不行。

<script>
(function () {
  var root = document.getElementById("sgd-lab");
  var cv = document.getElementById("sgd-cv"), ctx = cv.getContext("2d");
  var X0 = -3, X1 = 3, Y0 = -2, Y1 = 2;
  var W = cv.width, H = cv.height;
  var $ = function (id) { return document.getElementById(id); };
  var lr = $("sgd-lr"), noise = $("sgd-noise"), steps = $("sgd-steps"), decay = $("sgd-decay");

  // wells: [cx, cy, depth, width]; the right one is wide and deepest, the left one is narrow and nearly as deep
  var wells = [[1.6, 0.6, 1.0, 0.85], [-1.8, -0.9, 0.85, 0.3], [-0.4, 1.2, 0.6, 0.5], [0.4, -1.3, 0.45, 0.45]];
  function f(x, y) {
    var v = 0.03 * (x * x + y * y);
    for (var i = 0; i < wells.length; i++) {
      var w = wells[i], dx = x - w[0], dy = y - w[1];
      v -= w[2] * Math.exp(-(dx * dx + dy * dy) / (2 * w[3] * w[3]));
    }
    return v;
  }
  function grad(x, y) {
    var e = 1e-3;
    return [(f(x + e, y) - f(x - e, y)) / (2 * e), (f(x, y + e) - f(x, y - e)) / (2 * e)];
  }
  var FMIN = -1.02, FMAX = 0.3;
  function sx(x) { return (x - X0) / (X1 - X0) * W; }
  function sy(y) { return (Y1 - y) / (Y1 - Y0) * H; }
  function wx(px) { return X0 + px / W * (X1 - X0); }
  function wy(py) { return Y1 - py / H * (Y1 - Y0); }

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  function hex(c) { c = c.trim(); return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function tok(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }

  var field = document.createElement("canvas"); field.width = W; field.height = H;
  function paintField() {
    var lo = hex(tok("--sgd-lo")), hi = hex(tok("--sgd-hi")), ln = hex(tok("--sgd-contour"));
    var fc = field.getContext("2d"), img = fc.createImageData(W, H), d = img.data;
    for (var py = 0; py < H; py++) for (var px = 0; px < W; px++) {
      var t = (f(wx(px), wy(py)) - FMIN) / (FMAX - FMIN);
      t = Math.min(1, Math.max(0, t));
      var s = 1 - t;
      var r = lo[0] + (hi[0] - lo[0]) * s, g = lo[1] + (hi[1] - lo[1]) * s, b = lo[2] + (hi[2] - lo[2]) * s;
      var fr = (t * 16) % 1, a = fr < 0.07 ? 0.5 : 0;
      var i = (py * W + px) * 4;
      d[i] = r + (ln[0] - r) * a; d[i + 1] = g + (ln[1] - g) * a; d[i + 2] = b + (ln[2] - b) * a; d[i + 3] = 255;
    }
    fc.putImageData(img, 0, 0);
  }

  var start = [-2.6, 0.3];
  var runs = [];

  function simulate(seed) {
    var r = rng(seed), p = start.slice(), L = +lr.value, N = +noise.value, S = +steps.value, path = [p.slice()];
    for (var k = 0; k < S; k++) {
      var eta = decay.checked ? L / (1 + 3 * k / S) : L;
      var g = grad(p[0], p[1]);
      p[0] -= eta * (g[0] + N * gauss(r));
      p[1] -= eta * (g[1] + N * gauss(r));
      p[0] = Math.min(X1, Math.max(X0, p[0]));
      p[1] = Math.min(Y1, Math.max(Y0, p[1]));
      path.push(p.slice());
    }
    return path;
  }

  function draw(upTo) {
    ctx.drawImage(field, 0, 0);
    var pc = tok("--sgd-path");
    runs.forEach(function (run) {
      var n = upTo == null ? run.length : Math.min(run.length, upTo);
      ctx.strokeStyle = pc; ctx.globalAlpha = 0.75; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath();
      for (var i = 0; i < n; i++) { var x = sx(run[i][0]), y = sy(run[i][1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (n === run.length) {
        var e = run[n - 1], ex = sx(e[0]), ey = sy(e[1]);
        ctx.fillStyle = pc; ctx.beginPath();
        ctx.moveTo(ex, ey - 7); ctx.lineTo(ex + 6, ey); ctx.lineTo(ex, ey + 7); ctx.lineTo(ex - 6, ey); ctx.closePath(); ctx.fill();
      }
    });
    ctx.fillStyle = tok("--sgd-fg"); ctx.strokeStyle = tok("--sgd-surface"); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(sx(start[0]), sy(start[1]), 6, 0, 7); ctx.stroke(); ctx.fill();
  }

  function report() {
    if (!runs.length) { $("sgd-out").textContent = "还没有路径。点“再跑 5 次”。"; return; }
    var vals = runs.map(function (r) { return f(r[r.length - 1][0], r[r.length - 1][1]); });
    var best = Math.min.apply(null, vals), worst = Math.max.apply(null, vals);
    var inGlobal = runs.filter(function (r) { var e = r[r.length - 1]; return Math.hypot(e[0] - 1.6, e[1] - 0.6) < 0.7; }).length;
    $("sgd-out").innerHTML = "共 <b>" + runs.length + "</b> 条路径，终点损失 <b>" + best.toFixed(2) + "</b> ~ <b>" + worst.toFixed(2) +
      "</b>（全局最低约 −1.00）。落在最深的大坑里：<b>" + inGlobal + "</b> 条。";
  }
  function labels() {
    $("sgd-lrO").textContent = (+lr.value).toFixed(2); $("sgd-noiseO").textContent = (+noise.value).toFixed(2); $("sgd-stepsO").textContent = steps.value;
  }

  var raf = 0, seedBase = 1000;
  function addRuns(n, animate) {
    cancelAnimationFrame(raf);
    for (var i = 0; i < n; i++) runs.push(simulate(++seedBase));
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduce) { draw(); report(); return; }
    var k = 0, max = +steps.value + 1;
    (function tick() {
      k += Math.max(2, Math.ceil(max / 90));
      draw(k);
      if (k < max) raf = requestAnimationFrame(tick); else { draw(); report(); }
    })();
  }
  function reset() { cancelAnimationFrame(raf); runs = []; }

  cv.addEventListener("pointerdown", function (e) {
    var b = cv.getBoundingClientRect();
    start = [wx((e.clientX - b.left) / b.width * W), wy((e.clientY - b.top) / b.height * H)];
    reset(); addRuns(5, true);
  });
  $("sgd-run").onclick = function () { addRuns(5, true); };
  $("sgd-one").onclick = function () { addRuns(1, true); };
  $("sgd-clear").onclick = function () { reset(); draw(); report(); };
  [lr, noise, steps].forEach(function (el) { el.addEventListener("input", labels); });

  document.querySelectorAll(".sgd [data-start],.sgd [data-lr],.sgd [data-noise],.sgd [data-decay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var d = btn.dataset;
      if (d.lr) lr.value = d.lr;
      if (d.noise != null) noise.value = d.noise;
      if (d.decay != null) decay.checked = d.decay === "1";
      labels();
      if (d.start) { var s = d.start.split(","); start = [+s[0], +s[1]]; }
      reset(); addRuns(5, true);
      cv.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  function repaint() { paintField(); draw(); }
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  labels(); paintField(); addRuns(5, false);
})();
</script>
