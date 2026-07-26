// 返回顶部按钮：rAF 节流，只在跨越阈值时写样式
(function () {
    'use strict';

    var backTop = document.getElementById('back-top');

    if (!backTop) return;

    backTop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    var THRESHOLD = 300;
    var isNearTop = null;
    var ticking = false;

    backTop.style.transition = 'opacity 0.3s ease';

    function update() {
        ticking = false;
        var nearTop = window.pageYOffset <= THRESHOLD;
        if (nearTop === isNearTop) return;
        isNearTop = nearTop;
        backTop.style.opacity = nearTop ? '0.4' : '1';
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });

    update();
})();
