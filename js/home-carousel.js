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
      ? '<i class="fa fa-clone" aria-hidden="true"></i> Card stack'
      : '<i class="fa fa-bars" aria-hidden="true"></i> Traditional list';
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

    function render() {
      var compact = window.innerWidth < 768;
      var translateBase = compact ? 130 : 260;
      var rotateBase = compact ? 8 : 13;
      var scaleBase = compact ? 0.1 : 0.12;

      cards.forEach(function (card, index) {
        var offset = signedOffset(index, activeIndex, cards.length);
        var depth = Math.abs(offset);
        var isVisible = depth <= 2;
        var scale = depth === 0 ? 1 : Math.max(0.66, 1 - depth * scaleBase);
        var translateX = offset * translateBase;
        var translateY = depth * 28;
        var rotate = offset * -rotateBase;

        card.classList.toggle("is-active", depth === 0);
        card.classList.toggle("is-hidden", !isVisible);
        card.style.opacity = depth === 0 ? "1" : depth === 1 ? "0.72" : "0.34";
        card.style.pointerEvents = depth <= 1 ? "auto" : "none";
        card.style.zIndex = String(cards.length - depth);
        card.style.transform = "translateX(" + translateX + "px) translateY(" + translateY + "px) scale(" + scale + ") rotate(" + rotate + "deg)";
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === activeIndex);
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

    stackView && stackView.addEventListener("wheel", function (event) {
      if (isListView) {
        return;
      }

      if (Math.abs(event.deltaY) < 12 || wheelLocked) {
        return;
      }

      event.preventDefault();
      wheelLocked = true;
      setActive(activeIndex + (event.deltaY > 0 ? 1 : -1));
      window.setTimeout(function () {
        wheelLocked = false;
      }, 320);
    }, { passive: false });

    stackView && stackView.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
    });

    toggleButton && toggleButton.addEventListener("click", function () {
      toggleView();
    });

    searchButton && searchButton.addEventListener("click", function () {
      var trigger = document.querySelector(".search-icon a");
      if (trigger) {
        trigger.click();
      }
    });

    window.addEventListener("resize", render);

    render();
    updateToggleButton(toggleButton, isListView);
    toggleView(false);
  }

  document.addEventListener("DOMContentLoaded", initHomeStage);
})();
