(function () {
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function getPageConfig(root) {
        return {
            provider: root.getAttribute('data-provider') || 'disqus',
            pageUrl: root.getAttribute('data-page-url'),
            pageIdentifier: root.getAttribute('data-page-identifier'),
            pageTitle: root.getAttribute('data-page-title'),
            disqusShortname: root.getAttribute('data-disqus-shortname'),
            giscusRepo: root.getAttribute('data-giscus-repo'),
            giscusRepoId: root.getAttribute('data-giscus-repo-id'),
            giscusCategory: root.getAttribute('data-giscus-category'),
            giscusCategoryId: root.getAttribute('data-giscus-category-id'),
            giscusMapping: root.getAttribute('data-giscus-mapping'),
            giscusReactionsEnabled: root.getAttribute('data-giscus-reactions-enabled'),
            giscusEmitMetadata: root.getAttribute('data-giscus-emit-metadata'),
            giscusInputPosition: root.getAttribute('data-giscus-input-position'),
            giscusLang: root.getAttribute('data-giscus-lang'),
            giscusThemeLight: root.getAttribute('data-giscus-theme-light'),
            giscusThemeDark: root.getAttribute('data-giscus-theme-dark')
        };
    }

    function getGiscusTheme(config) {
        return getTheme() === 'dark' ? config.giscusThemeDark : config.giscusThemeLight;
    }

    function isLocalPreview() {
        var hostname = window.location.hostname;
        return hostname === '127.0.0.1' ||
            hostname === 'localhost' ||
            hostname === '0.0.0.0' ||
            hostname === '::1';
    }

    function setLoadingState(root, isLoading) {
        var loading = root.querySelector('[data-comments-loading]');
        if (!loading) {
            return;
        }

        if (isLoading) {
            loading.classList.remove('is-hidden');
        } else {
            loading.classList.add('is-hidden');
        }
    }

    function renderPreviewNotice(root) {
        var mount = root.querySelector('[data-comments-mount]');
        if (!mount || mount.querySelector('.comments-preview-note')) {
            setLoadingState(root, false);
            return;
        }

        var note = document.createElement('div');
        note.className = 'comments-preview-note';
        note.innerHTML = '<strong>Local preview mode</strong><span>为了避免把测试数据写进线上评论线程，本地只验证布局和挂载逻辑；真实评论加载与提交请在部署后的站点验证。</span>';
        mount.appendChild(note);
        setLoadingState(root, false);
    }

    function mountDisqus(root) {
        var config = getPageConfig(root);
        if (!config.disqusShortname) {
            setLoadingState(root, false);
            return;
        }

        if (isLocalPreview()) {
            renderPreviewNotice(root);
            root.setAttribute('data-comments-mounted', 'preview');
            return;
        }

        window.disqus_config = function () {
            this.page.url = config.pageUrl;
            this.page.identifier = config.pageIdentifier;
            this.page.title = config.pageTitle;
        };

        if (window.DISQUS) {
            window.DISQUS.reset({
                reload: true,
                config: window.disqus_config
            });
            setLoadingState(root, false);
            root.setAttribute('data-comments-mounted', 'true');
            return;
        }

        window.disqus_shortname = config.disqusShortname;
        var script = document.createElement('script');
        script.src = 'https://' + config.disqusShortname + '.disqus.com/embed.js';
        script.setAttribute('data-timestamp', +new Date());
        script.onload = function () {
            setLoadingState(root, false);
        };
        (document.head || document.body).appendChild(script);
        root.setAttribute('data-comments-mounted', 'true');
    }

    function mountGiscus(root) {
        var config = getPageConfig(root);
        var slot = root.querySelector('[data-giscus-slot]');
        if (!slot || !config.giscusRepoId || !config.giscusCategoryId) {
            setLoadingState(root, false);
            return;
        }

        slot.innerHTML = '';
        var script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-repo', config.giscusRepo);
        script.setAttribute('data-repo-id', config.giscusRepoId);
        script.setAttribute('data-category', config.giscusCategory);
        script.setAttribute('data-category-id', config.giscusCategoryId);
        script.setAttribute('data-mapping', config.giscusMapping);
        script.setAttribute('data-reactions-enabled', config.giscusReactionsEnabled);
        script.setAttribute('data-emit-metadata', config.giscusEmitMetadata);
        script.setAttribute('data-input-position', config.giscusInputPosition);
        script.setAttribute('data-lang', config.giscusLang);
        script.setAttribute('data-theme', getGiscusTheme(config));
        script.onload = function () {
            setLoadingState(root, false);
        };
        slot.appendChild(script);
        root.setAttribute('data-comments-mounted', 'true');
    }

    function updateGiscusTheme(root) {
        var frame = document.querySelector('iframe.giscus-frame');
        if (!frame || !frame.contentWindow) {
            return;
        }

        frame.contentWindow.postMessage({
            giscus: {
                setConfig: {
                    theme: getGiscusTheme(getPageConfig(root))
                }
            }
        }, 'https://giscus.app');
    }

    function mountComments(root) {
        if (root.getAttribute('data-comments-mounted') === 'true') {
            if ((root.getAttribute('data-provider') || 'disqus') === 'giscus') {
                updateGiscusTheme(root);
            } else if (window.DISQUS) {
                mountDisqus(root);
            }
            return;
        }

        if ((root.getAttribute('data-provider') || 'disqus') === 'giscus') {
            mountGiscus(root);
        } else {
            mountDisqus(root);
        }
    }

    function initComments() {
        var roots = document.querySelectorAll('[data-comments-root]');
        if (!roots.length) {
            return;
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    observer.unobserve(entry.target);
                    mountComments(entry.target);
                });
            }, { rootMargin: '240px 0px' });

            Array.prototype.forEach.call(roots, function (root) {
                observer.observe(root);
            });
            return;
        }

        Array.prototype.forEach.call(roots, mountComments);
    }

    document.addEventListener('DOMContentLoaded', initComments);
    document.addEventListener('themechange', function () {
        var roots = document.querySelectorAll('[data-comments-root]');
        Array.prototype.forEach.call(roots, function (root) {
            if ((root.getAttribute('data-provider') || 'disqus') === 'giscus') {
                updateGiscusTheme(root);
                return;
            }

            if (root.getAttribute('data-comments-mounted') === 'true' && window.DISQUS) {
                mountDisqus(root);
            }
        });
    });
})();
