// 返回顶部按钮功能
(function() {
    var backTop = document.getElementById('back-top');
    
    if (!backTop) return;
    
    // 点击返回顶部
    backTop.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 平滑滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 根据滚动位置调整按钮透明度
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backTop.style.opacity = "1.0";
        } else {
            backTop.style.opacity = "0.4";  // 靠近顶部时更透明
        }
    });
})();