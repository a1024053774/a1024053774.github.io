(function () {
  "use strict";

  function listAnchors(marker) {
    return (marker.getAttribute("data-notion-discussion") || "")
      .split(",")
      .map(function (value) { return value.trim(); })
      .filter(Boolean);
  }

  function init(root) {
    var panel = root.querySelector("[data-notion-discussions-panel]");
    var toggle = root.querySelector("[data-notion-discussions-toggle]");
    var close = root.querySelector("[data-notion-discussions-close]");
    var markers = document.querySelectorAll("[data-notion-discussion]");
    var cards = root.querySelectorAll("[data-notion-discussion-card]");

    if (!panel || !toggle) return;

    function setOpen(isOpen) {
      panel.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));
      root.classList.toggle("is-open", isOpen);
    }

    function clearActive() {
      Array.prototype.forEach.call(cards, function (card) {
        card.classList.remove("is-active");
      });
      Array.prototype.forEach.call(markers, function (marker) {
        marker.classList.remove("is-active");
      });
    }

    function focusDiscussion(anchor, updateHash) {
      var card = root.querySelector('[data-notion-discussion-card="' + anchor + '"]');
      if (!card) return;

      setOpen(true);
      clearActive();
      card.classList.add("is-active");
      Array.prototype.forEach.call(markers, function (marker) {
        if (listAnchors(marker).indexOf(anchor) !== -1) marker.classList.add("is-active");
      });
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      if (updateHash && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + anchor);
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(panel.hidden);
    });

    if (close) close.addEventListener("click", function () { setOpen(false); });

    Array.prototype.forEach.call(markers, function (marker) {
      marker.setAttribute("role", "button");
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("aria-label", "查看 Notion 批注");
      marker.addEventListener("click", function () {
        var anchors = listAnchors(marker);
        if (anchors.length) focusDiscussion(anchors[0], true);
      });
      marker.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          marker.click();
        }
      });
    });

    Array.prototype.forEach.call(cards, function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("a")) return;
        var anchor = card.getAttribute("data-notion-discussion");
        var marker = Array.prototype.find.call(markers, function (item) {
          return listAnchors(item).indexOf(anchor) !== -1;
        });
        if (marker) marker.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    var initialAnchor = window.location.hash.slice(1);
    if (initialAnchor && root.querySelector('[data-notion-discussion-card="' + initialAnchor + '"]')) {
      focusDiscussion(initialAnchor, false);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var roots = document.querySelectorAll("[data-notion-annotations]");
    Array.prototype.forEach.call(roots, init);
  });
}());
