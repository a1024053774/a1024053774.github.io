(function () {
  function initTagLab() {
    var lab = document.querySelector("[data-tag-lab]");
    if (!lab) {
      return;
    }

    var buttons = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-filter]"));
    var posts = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-post]"));

    function applyFilter(tag) {
      buttons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-tag-filter") === tag);
      });

      posts.forEach(function (post) {
        var tags = (post.getAttribute("data-tags") || "").split("||");
        var matched = !tag || tags.indexOf(tag) >= 0;
        post.classList.toggle("is-hidden", !matched);
      });

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

  document.addEventListener("DOMContentLoaded", initTagLab);
})();
