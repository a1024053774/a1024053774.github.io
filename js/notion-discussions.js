(function () {
  "use strict";

  function init(root) {
    var panel = root.querySelector("[data-notion-discussions-panel]");
    var toggle = root.querySelector("[data-notion-discussions-toggle]");
    var close = root.querySelector("[data-notion-discussions-close]");
    var markers = Array.from(document.querySelectorAll(".post-content [data-notion-discussion]"));
    var cards = Array.from(root.querySelectorAll("[data-notion-discussion-card]"));
    var trigger = toggle;
    var motion = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; };
    var ids = function (marker) { return marker.dataset.notionDiscussion.split(","); };

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (!open) trigger.focus({ preventScroll: true });
    }

    function show(anchors, source) {
      trigger = source;
      setOpen(true);
      cards.forEach(function (card) { card.classList.toggle("is-active", anchors.includes(card.id)); });
      markers.forEach(function (marker) { marker.classList.toggle("is-active", ids(marker).some(function (id) { return anchors.includes(id); })); });
      var card = cards.find(function (item) { return anchors.includes(item.id); });
      if (card) {
        card.focus({ preventScroll: true });
        card.scrollIntoView({ behavior: "auto", block: "nearest" });
        window.history.replaceState(null, "", "#" + card.id);
      }
    }

    markers.forEach(function (marker, index) {
      var anchors = ids(marker);
      marker.id = "annotation-" + anchors[0] + "-" + (index + 1);
      marker.setAttribute("role", "button");
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("aria-controls", panel.id);
      marker.setAttribute("aria-label", marker.textContent + "：查看 " + anchors.length + " 条批注");
      marker.addEventListener("click", function () { show(anchors, marker); });
      marker.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          show(anchors, marker);
        }
      });
    });
    root.querySelectorAll("[data-notion-return]").forEach(function (link) {
      var firstMarker = markers.find(function (item) { return ids(item).includes(link.dataset.notionReturn); });
      if (firstMarker) link.href = "#" + firstMarker.id;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var marker = markers.find(function (item) { return ids(item).includes(link.dataset.notionReturn); });
        if (marker) {
          setOpen(false);
          marker.focus({ preventScroll: true });
          marker.scrollIntoView({ behavior: motion(), block: "center" });
          window.history.replaceState(null, "", "#" + marker.id);
        }
      });
    });
    toggle.addEventListener("click", function () { trigger = toggle; setOpen(panel.hidden); });
    close.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !panel.hidden) setOpen(false); });
    function restoreDiscussion() {
      var anchor = window.location.hash.slice(1);
      if (cards.some(function (card) { return card.id === anchor; })) show([anchor], toggle);
    }
    window.addEventListener("hashchange", restoreDiscussion);
    restoreDiscussion();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-notion-annotations]").forEach(init);
  });
}());
