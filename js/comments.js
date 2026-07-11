const COMMENT_IDENTITY_KEY = "luckye-comment-identity";
const WALINE_STYLESHEET = "https://unpkg.com/@waline/client@v3/dist/waline.css";
const WALINE_MODULE = "https://unpkg.com/@waline/client@v3/dist/waline.js";

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function parseJSONAttribute(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function getPageConfig(root) {
  return {
    provider: root.getAttribute("data-provider") || "auto",
    pageUrl: root.getAttribute("data-page-url") || window.location.href,
    pageIdentifier: root.getAttribute("data-page-identifier") || window.location.pathname,
    pageTitle: root.getAttribute("data-page-title") || document.title,
    disqusShortname: root.getAttribute("data-disqus-shortname"),
    walineServerUrl: root.getAttribute("data-waline-server-url"),
    walineLang: root.getAttribute("data-waline-lang") || "zh-CN",
    walineLogin: root.getAttribute("data-waline-login") || "disable",
    walineDark: root.getAttribute("data-waline-dark") || "html[data-theme=\"dark\"]",
    walinePageSize: Number(root.getAttribute("data-waline-page-size") || "12"),
    walineMeta: parseJSONAttribute(root.getAttribute("data-waline-meta"), ["nick"]),
    walineRequiredMeta: parseJSONAttribute(root.getAttribute("data-waline-required-meta"), ["nick"]),
    walineWordLimit: parseJSONAttribute(root.getAttribute("data-waline-word-limit"), [1, 1200])
  };
}

function resolveProvider(config) {
  if (config.provider === "waline" && config.walineServerUrl) {
    return "waline";
  }

  if (config.provider === "disqus" && config.disqusShortname) {
    return "disqus";
  }

  if (config.provider === "auto") {
    if (config.walineServerUrl) {
      return "waline";
    }
  }

  return "none";
}

function resolveWalinePath(config) {
  try {
    var pathname = new URL(config.pageUrl).pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return pathname || "/";
  } catch (error) {
    var fallback = window.location.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return fallback || "/";
  }
}

function isLocalPreview() {
  var hostname = window.location.hostname;
  return hostname === "127.0.0.1" ||
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1";
}

function setLoadingState(root, isLoading) {
  var loading = root.querySelector("[data-comments-loading]");
  if (!loading) {
    return;
  }

  loading.classList.toggle("is-hidden", !isLoading);
}

function setProviderPill(root, text) {
  var pill = root.querySelector("[data-comments-provider-pill]");
  if (pill) {
    pill.textContent = text;
  }
}

function setProviderNote(root, message, tone) {
  var note = root.querySelector("[data-comments-note]");
  if (!note) {
    return;
  }

  if (!message) {
    note.textContent = "";
    note.removeAttribute("data-tone");
    note.classList.add("is-hidden");
    return;
  }

  note.textContent = message;
  note.setAttribute("data-tone", tone || "neutral");
  note.classList.remove("is-hidden");
}

function setSlotVisibility(root, provider) {
  var walineSlot = root.querySelector("[data-waline-slot]");
  var disqusSlot = root.querySelector("[data-disqus-slot]");

  if (walineSlot) {
    walineSlot.classList.toggle("is-hidden", provider !== "waline");
  }

  if (disqusSlot) {
    disqusSlot.classList.toggle("is-hidden", provider !== "disqus");
  }
}

function ensureWalineStyles() {
  if (document.querySelector("link[data-waline-style]")) {
    return;
  }

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = WALINE_STYLESHEET;
  link.setAttribute("data-waline-style", "true");
  document.head.appendChild(link);
}

async function getWalineInit() {
  if (!window.__luckyeWalineInit) {
    var walineModule = await import(WALINE_MODULE);
    window.__luckyeWalineInit = walineModule.init;
  }

  return window.__luckyeWalineInit;
}

function getStoredIdentity() {
  try {
    return window.localStorage.getItem(COMMENT_IDENTITY_KEY) || "";
  } catch (error) {
    return "";
  }
}

function setStoredIdentity(identity) {
  try {
    if (identity) {
      window.localStorage.setItem(COMMENT_IDENTITY_KEY, identity);
    } else {
      window.localStorage.removeItem(COMMENT_IDENTITY_KEY);
    }
  } catch (error) {
    return;
  }
}

function updateIdentityState(root, identity) {
  var state = root.querySelector("[data-comments-identity-state]");
  var buttons = root.querySelectorAll("[data-comment-identity]");

  Array.prototype.forEach.call(buttons, function (button) {
    button.classList.toggle("is-active", button.getAttribute("data-comment-identity") === identity);
  });

  if (!state) {
    return;
  }

  if (identity) {
    state.textContent = "当前预设身份：" + identity;
  } else {
    state.textContent = "当前未选择预设身份";
  }
}

function syncWalineIdentity(root) {
  var identity = getStoredIdentity();
  if (!identity) {
    return;
  }

  var input = root.querySelector(".wl-nick input, input[name='nick'], input[placeholder='昵称']");
  if (!input || input.value === identity) {
    return;
  }

  input.value = identity;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function initIdentityPresets(root) {
  var row = root.querySelector("[data-comments-identity-row]");
  if (!row) {
    return;
  }

  updateIdentityState(root, getStoredIdentity());

  row.addEventListener("click", function (event) {
    var target = event.target.closest("[data-comment-identity]");
    if (!target) {
      return;
    }

    var identity = target.getAttribute("data-comment-identity") || "";
    setStoredIdentity(identity);
    updateIdentityState(root, identity);
    syncWalineIdentity(root);
  });
}

async function mountWaline(root) {
  var config = getPageConfig(root);
  var slot = root.querySelector("[data-waline-slot]");
  if (!slot || !config.walineServerUrl) {
    return false;
  }

  ensureWalineStyles();
  setSlotVisibility(root, "waline");
  setProviderPill(root, "WALINE");

  if (!root.__walineMounted) {
    var init = await getWalineInit();
    slot.innerHTML = "";

    root.__walineInstance = init({
      el: slot,
      serverURL: config.walineServerUrl,
      path: resolveWalinePath(config),
      lang: config.walineLang,
      login: config.walineLogin,
      dark: config.walineDark,
      meta: config.walineMeta,
      requiredMeta: config.walineRequiredMeta,
      pageSize: config.walinePageSize,
      wordLimit: config.walineWordLimit,
      reaction: false,
      search: false,
      locale: {
        sofa: "还没有评论，来写第一条。",
        placeholder: "写下你的看法…",
        submit: "发布评论",
        nick: "昵称",
        mail: "邮箱",
        link: "网址"
      }
    });

    root.__walineMounted = true;
  }

  setLoadingState(root, false);
  setProviderNote(root, "匿名评论已启用，只需要昵称即可留言。", "success");
  root.setAttribute("data-comments-mounted", "true");
  syncWalineIdentity(root);
  return true;
}

function renderPreviewNotice(root, message) {
  setProviderNote(root, message, "neutral");
  setLoadingState(root, false);
  root.setAttribute("data-comments-mounted", "preview");
}

function mountDisqus(root) {
  var config = getPageConfig(root);
  var slot = root.querySelector("[data-disqus-slot]");
  if (!slot || !config.disqusShortname) {
    setProviderNote(root, "当前没有可用的评论服务配置。", "warning");
    setLoadingState(root, false);
    return;
  }

  setSlotVisibility(root, "disqus");
  setProviderPill(root, "DISQUS");

  if (isLocalPreview()) {
    renderPreviewNotice(root, "本地仅验证评论区布局。若要开启无需注册的匿名评论，请给站点补上 Waline serverURL。");
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
    setProviderNote(root, "当前回退到 Disqus。若要真正免注册留言，需要启用 Waline 服务端。", "warning");
    root.setAttribute("data-comments-mounted", "true");
    return;
  }

  window.disqus_shortname = config.disqusShortname;
  var script = document.createElement("script");
  script.src = "https://" + config.disqusShortname + ".disqus.com/embed.js";
  script.setAttribute("data-timestamp", String(+new Date()));
  script.onload = function () {
    setLoadingState(root, false);
    setProviderNote(root, "当前回退到 Disqus。若要真正免注册留言，需要启用 Waline 服务端。", "warning");
  };
  script.onerror = function () {
    setLoadingState(root, false);
    setProviderNote(root, "Disqus 加载失败。匿名评论前端已经准备好，但还缺少 Waline 服务端地址。", "warning");
  };
  (document.head || document.body).appendChild(script);
  root.setAttribute("data-comments-mounted", "true");
}

async function mountComments(root) {
  var resolvedProvider = resolveProvider(getPageConfig(root));

  if (resolvedProvider === "waline") {
    try {
      await mountWaline(root);
      return;
    } catch (error) {
      setProviderNote(root, "Waline 初始化失败，已回退到备用评论方案。", "warning");
    }
  }

  if (resolvedProvider === "disqus") {
    mountDisqus(root);
    return;
  }

  setLoadingState(root, false);
  setSlotVisibility(root, "none");
  setProviderPill(root, "SETUP");
  setProviderNote(root, "当前还不能公共留言：GitHub Pages 是静态站，需先配置 Waline serverURL。配置后选择预设身份，再输入内容即可发布。", "warning");
}

function observeAndMount(root) {
  if (root.__commentsObserved) {
    return;
  }

  root.__commentsObserved = true;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        observer.unobserve(entry.target);
        mountComments(entry.target);
      });
    }, { rootMargin: "220px 0px" });

    observer.observe(root);
    return;
  }

  mountComments(root);
}

function initComments() {
  var roots = document.querySelectorAll("[data-comments-root]");
  if (!roots.length) {
    return;
  }

  Array.prototype.forEach.call(roots, function (root) {
    initIdentityPresets(root);
    observeAndMount(root);
  });
}

document.addEventListener("DOMContentLoaded", initComments);
document.addEventListener("themechange", function () {
  var roots = document.querySelectorAll("[data-comments-root]");
  Array.prototype.forEach.call(roots, syncWalineIdentity);
});
