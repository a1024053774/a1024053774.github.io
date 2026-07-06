// Theme initialization and toggle behavior.
(function () {
    var root = document.documentElement;
    var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (error) {
            return null;
        }
    }

    function resolveTheme() {
        return getStoredTheme() || (mediaQuery.matches ? 'dark' : 'light');
    }

    function applyTheme(theme, emitEvent) {
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;

        if (emitEvent) {
            document.dispatchEvent(new CustomEvent('themechange', {
                detail: {
                    theme: theme
                }
            }));
        }
    }

    function updateDarkModeIcon(theme) {
        var darkModeIcon = document.getElementById('darkmode-icon');

        if (!darkModeIcon) {
            return;
        }

        darkModeIcon.classList.remove('fa-moon-o', 'fa-sun-o');
        darkModeIcon.classList.add(theme === 'dark' ? 'fa-sun-o' : 'fa-moon-o');
    }

    applyTheme(resolveTheme(), false);

    document.addEventListener('DOMContentLoaded', function () {
        var darkModeToggle = document.getElementById('darkmode-toggle');

        updateDarkModeIcon(resolveTheme());

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', function () {
                var newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

                try {
                    localStorage.setItem('theme', newTheme);
                } catch (error) {
                    // Ignore localStorage write failures and still switch theme.
                }

                applyTheme(newTheme, true);
                updateDarkModeIcon(newTheme);
            });
        }

        var onMediaChange = function (event) {
            if (getStoredTheme()) {
                return;
            }

            var nextTheme = event.matches ? 'dark' : 'light';
            applyTheme(nextTheme, true);
            updateDarkModeIcon(nextTheme);
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', onMediaChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(onMediaChange);
        }
    });
})();
