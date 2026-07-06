(function () {
  var LANGUAGE_LABELS = {
    bash: "Bash",
    c: "C",
    cpp: "C++",
    coq: "Coq",
    css: "CSS",
    haskell: "Haskell",
    hs: "Haskell",
    html: "HTML",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    json: "JSON",
    jsx: "JSX",
    kotlin: "Kotlin",
    ocaml: "OCaml",
    powershell: "PowerShell",
    python: "Python",
    ruby: "Ruby",
    rust: "Rust",
    sh: "Shell",
    sql: "SQL",
    text: "Text",
    typescript: "TypeScript",
    ts: "TypeScript",
    xml: "XML",
    yaml: "YAML"
  };

  function prettifyLanguage(language) {
    return LANGUAGE_LABELS[language] || language.charAt(0).toUpperCase() + language.slice(1);
  }

  function inferLanguage(block) {
    var candidates = [block].concat(Array.prototype.slice.call(block.querySelectorAll("[class*='language-']")));

    for (var i = 0; i < candidates.length; i += 1) {
      var className = candidates[i].className || "";
      var match = className.match(/language-([A-Za-z0-9_+-]+)/);
      if (match) {
        return prettifyLanguage(match[1].toLowerCase());
      }
    }

    return "Text";
  }

  function enhanceCodeBlock(block) {
    if (block.getAttribute("data-code-enhanced") === "true") {
      return;
    }

    block.setAttribute("data-code-enhanced", "true");
    block.classList.add("code-window");
    block.setAttribute("data-language", inferLanguage(block));

    var header = document.createElement("div");
    header.className = "code-window__header";
    header.innerHTML =
      '<span class="code-window__traffic" aria-hidden="true">' +
      '<i></i><i></i><i></i>' +
      "</span>" +
      '<span class="code-window__language">' + block.getAttribute("data-language") + "</span>";

    block.insertBefore(header, block.firstChild);
  }

  function initCodeBlocks() {
    var blocks = document.querySelectorAll(".post-container div.highlighter-rouge, .post-container figure.highlight");
    Array.prototype.forEach.call(blocks, function (block) {
      if (!block.querySelector("pre")) {
        return;
      }

      enhanceCodeBlock(block);
    });
  }

  document.addEventListener("DOMContentLoaded", initCodeBlocks);
})();
