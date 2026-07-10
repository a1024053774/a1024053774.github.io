(function () {
  function initTagLab() {
    var lab = document.querySelector("[data-tag-lab]");
    if (!lab) {
      return;
    }

    var buttons = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-filter]"));
    var posts = Array.prototype.slice.call(lab.querySelectorAll("[data-tag-post]"));
    var summary = lab.querySelector("[data-tag-summary]");
    var results = lab.querySelector("[data-tag-results]");
    var featured = lab.querySelector("[data-tag-featured]");
    var featuredName = lab.querySelector("[data-tag-feature-name]");
    var featuredDescription = lab.querySelector("[data-tag-feature-description]");
    var featuredAction = lab.querySelector("[data-tag-feature-action]");
    var deckFront = lab.querySelector("[data-tag-deck-front]");
    var deckBack = lab.querySelector("[data-tag-deck-back]");

    function fillDeckCard(card, post) {
      if (!card || !post) {
        return;
      }

      var media = card.querySelector("[data-tag-deck-media]");
      var meta = card.querySelector("[data-tag-deck-meta]");
      var title = card.querySelector("[data-tag-deck-title]");
      var cover = post.getAttribute("data-cover") || "";

      card.href = post.getAttribute("data-url") || "#";
      card.classList.toggle("is-fallback", !cover);
      if (media) {
        media.style.backgroundImage = cover ? 'url("' + cover.replace(/"/g, "%22") + '")' : "";
      }
      if (meta) {
        meta.textContent = post.getAttribute("data-date") || "";
      }
      if (title) {
        title.textContent = post.getAttribute("data-title") || "";
      }
    }

    function updateFeatured(tag, matchedPosts) {
      if (!featured) {
        return;
      }

      var hasTopic = Boolean(tag && matchedPosts.length);
      featured.classList.toggle("is-hidden", !hasTopic);
      if (results) {
        results.classList.toggle("is-topic-view", hasTopic);
      }

      if (!hasTopic) {
        featured.classList.remove("is-ready");
        return;
      }

      var latest = matchedPosts[0];
      var secondary = matchedPosts[1] || null;
      featured.classList.toggle("is-single", !secondary);
      if (featuredName) {
        featuredName.textContent = "「" + tag + "」";
      }
      if (featuredDescription) {
        featuredDescription.textContent = "这里收录 " + matchedPosts.length + " 篇相关笔记。最新一篇是「" + (latest.getAttribute("data-title") || tag) + "」，可以从它开始，也可以继续向下浏览全部文章。";
      }
      if (featuredAction) {
        featuredAction.href = latest.getAttribute("data-url") || "#";
      }

      fillDeckCard(deckFront, latest);
      if (secondary) {
        fillDeckCard(deckBack, secondary);
        deckBack.removeAttribute("aria-hidden");
        deckBack.removeAttribute("tabindex");
      } else {
        deckBack.setAttribute("aria-hidden", "true");
        deckBack.setAttribute("tabindex", "-1");
      }
      featured.classList.remove("is-ready");
      window.requestAnimationFrame(function () {
        featured.classList.add("is-ready");
      });
    }

    function applyFilter(tag) {
      buttons.forEach(function (button) {
        var isActive = button.getAttribute("data-tag-filter") === tag;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      var visibleCount = 0;
      var matchedPosts = [];
      posts.forEach(function (post) {
        var tags = (post.getAttribute("data-tags") || "").split("||");
        var matched = !tag || tags.indexOf(tag) >= 0;
        post.classList.toggle("is-hidden", !matched);
        post.setAttribute("aria-hidden", String(!matched));
        if (matched) {
          visibleCount += 1;
          matchedPosts.push(post);
        }
      });

      updateFeatured(tag, matchedPosts);

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
