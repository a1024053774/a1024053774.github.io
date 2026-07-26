// 阅读进度条：transform + rAF，避免每帧触发布局
(function () {
    'use strict';

    function init() {
        var oldBar = document.getElementById('reading-progress-bar');
        if (oldBar) {
            oldBar.parentNode.removeChild(oldBar);
        }

        var progressBar = document.createElement('div');
        progressBar.id = 'reading-progress-bar';
        progressBar.className = 'reading-progress-bar';

        // 用 scaleX 代替 width：动画只走合成器，不触发 layout/paint
        var style = progressBar.style;
        style.position = 'fixed';
        style.top = '0';
        style.left = '0';
        style.width = '100%';
        style.height = '6px';
        style.backgroundColor = '#0085a1';
        style.zIndex = '99999';
        style.boxShadow = '0 0 8px rgba(0, 133, 161, 0.8)';
        style.transformOrigin = 'left center';
        style.transform = 'scaleX(0)';
        style.pointerEvents = 'none';

        document.body.insertBefore(progressBar, document.body.firstChild);

        var docEl = document.documentElement;
        var ticking = false;

        function update() {
            ticking = false;
            var height = docEl.scrollHeight - docEl.clientHeight;
            var winScroll = window.pageYOffset || docEl.scrollTop;
            var ratio = height > 0 ? winScroll / height : 0;
            style.transform = 'scaleX(' + Math.min(Math.max(ratio, 0), 1) + ')';
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        update();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
