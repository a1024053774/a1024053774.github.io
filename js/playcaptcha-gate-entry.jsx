import * as React from "react";
import { createRoot } from "react-dom/client";
import { ClawCaptcha } from "../_assets-src/playcaptcha/index.ts";
import "../_assets-src/playcaptcha/clawcaptcha.css";
import "./playcaptcha-gate-entry.css";

const roots = new WeakMap();
globalThis.React = React;

window.mountPlayCaptcha = function (element, options) {
  const existingRoot = roots.get(element);
  if (existingRoot) {
    existingRoot.unmount();
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(
    <ClawCaptcha
      title="完成小游戏后发布评论"
      assetBase="/assets/playcaptcha/toys/"
      onVerify={options.onVerify}
    />
  );

  return function () {
    root.unmount();
    roots.delete(element);
  };
};
