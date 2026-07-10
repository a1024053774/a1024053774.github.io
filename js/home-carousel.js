(function () {
  function wrapIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function signedOffset(index, active, length) {
    var raw = index - active;
    var alt = raw > 0 ? raw - length : raw + length;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
  }

  function updateToggleButton(button, isListView) {
    if (!button) {
      return;
    }

    button.innerHTML = isListView
      ? '<i class="fa fa-clone" aria-hidden="true"></i> 卡片视图'
      : '<i class="fa fa-bars" aria-hidden="true"></i> 列表视图';
    button.setAttribute("aria-pressed", String(isListView));
  }

  function initHomeStage() {
    var stage = document.querySelector("[data-home-stage]");
    if (!stage) {
      return;
    }

    var cards = Array.prototype.slice.call(stage.querySelectorAll("[data-home-card]"));
    var dots = Array.prototype.slice.call(stage.querySelectorAll("[data-home-dot]"));
    var progress = stage.querySelector("[data-home-progress]");
    var stackView = stage.querySelector("[data-home-stack-view]");
    var viewport = stage.querySelector("[data-home-viewport]");
    var listView = stage.querySelector("[data-home-list-view]");
    var toggleButton = stage.querySelector("[data-home-view-toggle]");
    var searchButton = stage.querySelector("[data-home-search]");
    var previousButton = stage.querySelector("[data-home-prev]");
    var nextButton = stage.querySelector("[data-home-next]");

    if (!cards.length) {
      return;
    }

    var activeIndex = 0;
    var isListView = false;
    var wheelLocked = false;
    var wheelAccumulator = 0;
    var touchStartY = null;

    function render() {
      var compact = window.innerWidth < 768;
      var translateBase = compact ? 205 : 260;
      var rotateBase = compact ? 11 : 15;
      var scaleBase = compact ? 0.08 : 0.09;

      cards.forEach(function (card, index) {
        var offset = signedOffset(index, activeIndex, cards.length);
        var depth = Math.abs(offset);
        var isVisible = depth <= 2;
        var scale = depth === 0 ? 1 : Math.max(0.66, 1 - depth * scaleBase);
        var translateY = offset * translateBase;
        var rotateX = offset * -rotateBase;

        card.classList.toggle("is-active", depth === 0);
        card.classList.toggle("is-hidden", !isVisible);
        card.classList.toggle("is-before", offset < 0);
        card.classList.toggle("is-after", offset > 0);
        card.style.opacity = !isVisible ? "0" : depth === 0 ? "1" : depth === 1 ? "0.46" : "0.16";
        card.style.visibility = isVisible ? "visible" : "hidden";
        card.style.pointerEvents = depth <= 1 ? "auto" : "none";
        card.style.zIndex = String(cards.length - depth);
        card.style.filter = depth === 0 ? "none" : "blur(" + depth + "px) saturate(" + (1 - depth * 0.12) + ")";
        card.style.transform = "translate3d(-50%, calc(-50% + " + translateY + "px), 0) scale(" + scale + ") rotateX(" + rotateX + "deg)";
        card.setAttribute("aria-hidden", String(!isVisible));
        card.tabIndex = isVisible ? 0 : -1;
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === activeIndex);
        dot.classList.toggle("is-nearby", Math.abs(signedOffset(index, activeIndex, dots.length)) <= 2);
        dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
      });

      if (progress) {
        progress.textContent = (activeIndex + 1) + " / " + cards.length;
      }
    }

    function setActive(index) {
      activeIndex = wrapIndex(index, cards.length);
      render();
    }

    function toggleView(forceListView) {
      isListView = typeof forceListView === "boolean" ? forceListView : !isListView;
      stackView.classList.toggle("is-hidden", isListView);
      listView.classList.toggle("is-hidden", !isListView);
      stage.classList.toggle("is-list-mode", isListView);
      updateToggleButton(toggleButton, isListView);
    }

    previousButton && previousButton.addEventListener("click", function () {
      setActive(activeIndex - 1);
    });

    nextButton && nextButton.addEventListener("click", function () {
      setActive(activeIndex + 1);
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setActive(Number(dot.getAttribute("data-home-dot")));
      });
    });

    cards.forEach(function (card) {
      card.addEventListener("click", function (event) {
        var targetIndex = Number(card.getAttribute("data-index"));
        if (targetIndex === activeIndex) {
          return;
        }

        event.preventDefault();
        setActive(targetIndex);
      });
    });

    viewport && viewport.addEventListener("wheel", function (event) {
      if (isListView) {
        return;
      }

      var delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (Math.abs(delta) < 4) {
        return;
      }

      event.preventDefault();
      wheelAccumulator += delta;

      if (wheelLocked || Math.abs(wheelAccumulator) < 24) {
        return;
      }

      wheelLocked = true;
      setActive(activeIndex + (wheelAccumulator > 0 ? 1 : -1));
      wheelAccumulator = 0;
      window.setTimeout(function () {
        wheelLocked = false;
      }, 220);
    }, { passive: false });

    viewport && viewport.addEventListener("touchstart", function (event) {
      touchStartY = event.touches.length ? event.touches[0].clientY : null;
    }, { passive: true });

    viewport && viewport.addEventListener("touchend", function (event) {
      if (touchStartY === null || !event.changedTouches.length) {
        return;
      }

      var deltaY = touchStartY - event.changedTouches[0].clientY;
      touchStartY = null;
      if (Math.abs(deltaY) >= 36) {
        setActive(activeIndex + (deltaY > 0 ? 1 : -1));
      }
    }, { passive: true });

    stackView && stackView.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
    });

    toggleButton && toggleButton.addEventListener("click", function () {
      toggleView();
    });

    searchButton && searchButton.addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("site-search-open", {
        detail: { anchor: searchButton }
      }));
    });

    window.addEventListener("resize", render);

    render();
    stage.classList.add("is-initialized");
    updateToggleButton(toggleButton, isListView);
    toggleView(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeStage);
  } else {
    initHomeStage();
  }
})();
