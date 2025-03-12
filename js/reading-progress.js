// 阅读进度条功能
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，初始化进度条");
    
    // 创建进度条元素（总是创建新的，确保样式正确）
    var oldBar = document.getElementById('reading-progress-bar');
    if (oldBar) {
        oldBar.parentNode.removeChild(oldBar); // 移除旧元素
    }
    
    var progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    progressBar.className = 'reading-progress-bar';
    document.body.insertBefore(progressBar, document.body.firstChild);
    
    console.log("进度条元素已创建:", progressBar);
    
    // 强制设置初始样式
    progressBar.style.position = "fixed";
    progressBar.style.top = "0";
    progressBar.style.left = "0";
    progressBar.style.height = "6px";
    progressBar.style.backgroundColor = "#0085a1";
    progressBar.style.width = "0%";
    progressBar.style.zIndex = "99999";
    progressBar.style.transition = "width 0.2s ease";
    progressBar.style.boxShadow = "0 0 8px rgba(0, 133, 161, 0.8)";
    
    // 更新进度条函数
    function updateProgressBar() {
        var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var scrolled = (winScroll / height) * 100;
        
        // 输出调试信息
        // console.log("滚动位置:", winScroll, "总高度:", height, "进度:", scrolled.toFixed(1) + "%");
        progressBar.style.width = scrolled + "%";
    }
    
    // 添加事件监听器
    window.addEventListener('scroll', updateProgressBar);
    window.addEventListener('resize', updateProgressBar);
    
    // 初始化进度条
    console.log("初始化进度条状态");
    updateProgressBar();
    
    // // 测试可见性
    // console.log("测试进度条可见性");
    // var testWidth = 20;
    // var testInterval = setInterval(function() {
    //     progressBar.style.width = testWidth + "%";
    //     testWidth += 20;
        
    //     if (testWidth > 100) {
    //         clearInterval(testInterval);
    //         setTimeout(function() {
    //             progressBar.style.width = "0%";
    //             updateProgressBar();
    //         }, 1000);
    //     }
    // }, 300);
}
);