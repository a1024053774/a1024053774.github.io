(function () {
  function initTagLab() {
    var lab = document.querySelector("[data-tag-lab]");
    if (!lab) {
      return;
    }

    var buttons = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-filter]"));
    var posts = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-post]"));
    var summary = lab.querySelector("[data-tag-summary]");

    function applyFilter(tag) {
      buttons.forEach(function (button) {
        var isActive = button.getAttribute("data-tag-filter") === tag;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      var visibleCount = 0;
      posts.forEach(function (post) {
        var tags = (post.getAttribute("data-tags") || "").split("||");
        var matched = !tag || tags.indexOf(tag) >= 0;
        post.classList.toggle("is-hidden", !matched);
        post.setAttribute("aria-hidden", String(!matched));
        if (matched) {
          visibleCount += 1;
        }
      });

      if (summary) {
        summary.textContent = tag
          ? "“" + tag + "”下的 " + visibleCount + " 篇文章"
          : "全部 " + visibleCount + " 篇公开文章";
      }

      if (tag) {
        window.history.replaceState(null, "", window.location.pathname + "#" + encodeURIComponent(tag));
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-tag-filter") || "");
      });
    });

    if (window.location.hash) {
      var initialHash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      var target = buttons.find(function (button) {
        return button.getAttribute("data-tag-filter") === initialHash || button.id === initialHash;
      });

      if (target) {
        applyFilter(target.getAttribute("data-tag-filter") || "");
        return;
      }
    }

    applyFilter("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTagLab);
  } else {
    initTagLab();
  }
})();
