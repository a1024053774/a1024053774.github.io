// 深色模式实现脚本
(function() {
    // DOM 元素加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        // 获取切换按钮和图标元素
        const darkModeToggle = document.getElementById('darkmode-toggle');
        const darkModeIcon = document.getElementById('darkmode-icon');
        
        // 检查本地存储中的主题设置
        const savedTheme = localStorage.getItem('theme');
        // 检测系统偏好
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 初始化主题设置
        let currentTheme;
        
        // 如果有保存的设置，使用保存的设置；否则根据系统偏好设置
        if (savedTheme) {
            currentTheme = savedTheme;
        } else {
            currentTheme = prefersDarkMode ? 'dark' : 'light';
        }
        
        // 应用当前主题
        applyTheme(currentTheme);
        
        // 更新按钮图标状态
        updateDarkModeIcon(currentTheme);
        
        // 添加点击事件
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', function() {
                // 切换主题
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                
                // 保存到本地存储
                localStorage.setItem('theme', newTheme);
                
                // 应用新主题
                applyTheme(newTheme);
                
                // 更新按钮图标
                updateDarkModeIcon(newTheme);
            });
        }
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // 只有没有手动设置过的才自动跟随系统
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
                updateDarkModeIcon(newTheme);
            }
        });
        
        // 应用主题函数
        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // 更新图标函数
        function updateDarkModeIcon(theme) {
            if (!darkModeIcon) return;
            
            if (theme === 'dark') {
                darkModeIcon.classList.remove('fa-moon-o');
                darkModeIcon.classList.add('fa-sun-o');
            } else {
                darkModeIcon.classList.remove('fa-sun-o');
                darkModeIcon.classList.add('fa-moon-o');
            }
        }
    });
})();