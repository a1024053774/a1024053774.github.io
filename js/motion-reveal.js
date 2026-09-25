// 滚动显现：[data-reveal] 进入视口时加 is-revealed，只播一次。
// head 里仅在支持 IntersectionObserver 时才给 <html> 加 has-reveal，
// 并在 3 秒后检查 data-reveal-ready：本脚本没接管就撤掉 has-reveal，
// 所以不支持的浏览器、脚本被拦截或报错时内容始终可见。
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("has-reveal")) {
    return;
  }

  function init() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) {
      root.setAttribute("data-reveal-ready", "");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    Array.prototype.forEach.call(targets, function (target) {
      observer.observe(target);
    });

    // 观察器全部挂好后才标记接管，中途出错时 head 里的兜底会让内容直接显示
    root.setAttribute("data-reveal-ready", "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
