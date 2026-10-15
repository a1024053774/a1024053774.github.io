(function () {
  "use strict";

  function init() {
    var hub = document.querySelector("[data-course-hub]");
    if (!hub || !("IntersectionObserver" in window)) return;

    var links = Array.prototype.slice.call(hub.querySelectorAll("[data-course-link], [data-course-phase-link]"));
    var sections = Array.prototype.slice.call(hub.querySelectorAll("[data-course-chapter], [data-course-phase]"));
    var byId = {};
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace(/^#/, "");
      if (id) byId[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = byId[entry.target.id];
        if (!link) return;
        links.forEach(function (item) { item.classList.remove("is-active"); });
        link.classList.add("is-active");
      });
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  document.addEventListener("DOMContentLoaded", init);
}());
