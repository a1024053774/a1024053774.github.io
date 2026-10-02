// 阅读进度：顶部像素条 + 文章侧栏的像素刻度表（仿终端限额条）
// clip-path 按 4px 一格对齐裁切，填充图案不被拉伸，也不触发 layout
(function () {
    'use strict';

    var CELL = 4; // 与 CSS 中棋盘格周期一致

    function init() {
        var docEl = document.documentElement;
        var topBar = document.getElementById('reading-progress-bar');
        if (!topBar) {
            topBar = document.createElement('div');
            topBar.id = 'reading-progress-bar';
            topBar.className = 'reading-progress-bar';
            document.body.insertBefore(topBar, document.body.firstChild);
        }

        var meter = document.querySelector('[data-reading-meter]');
        var track = meter && meter.querySelector('.ink-meter__track');
        var fill = meter && meter.querySelector('.ink-meter__fill');
        var value = meter && meter.querySelector('.ink-meter__value');
        if (meter) document.body.classList.add('has-reading-meter');

        var ticking = false;
        var lastPct = -1;

        function ratio() {
            var height = docEl.scrollHeight - docEl.clientHeight;
            var scrolled = window.pageYOffset || docEl.scrollTop;
            var r = height > 0 ? scrolled / height : 0;
            return Math.min(Math.max(r, 0), 1);
        }

        // 把比例吸附到整格，返回 clip-path 右侧应裁掉的百分比
        function snappedClip(el, r) {
            var width = el.clientWidth;
            var cells = Math.max(1, Math.floor(width / CELL));
            var shown = Math.round(r * cells) / cells;
            return ((1 - shown) * 100).toFixed(3) + '%';
        }

        function update() {
            ticking = false;
            var r = ratio();
            topBar.style.clipPath = 'inset(0 ' + snappedClip(topBar, r) + ' 0 0)';

            if (!meter) return;
            fill.style.clipPath = 'inset(0 ' + snappedClip(track, r) + ' 0 0)';
            var pct = Math.round(r * 100);
            if (pct !== lastPct) {
                lastPct = pct;
                value.textContent = pct + '%';
                track.setAttribute('aria-valuenow', pct);
            }
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        // 点击刻度条直接跳到对应位置
        if (track) {
            track.addEventListener('click', function (e) {
                var rect = track.getBoundingClientRect();
                var r = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                window.scrollTo({ top: r * (docEl.scrollHeight - docEl.clientHeight), behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        // 图片、评论等晚到的内容会改变文档高度
        window.addEventListener('load', requestUpdate);
        update();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
