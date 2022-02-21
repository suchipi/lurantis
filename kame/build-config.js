// this stuff is used to build lurantis itself, not used in lurantis for bundling stuff.
const path = require("path");
const kame = require("kame");

exports.load = function load(filepath) {
  const code = kame.defaultLoader.load(filepath);

  // pretty-print-error obfuscates this kleur require to avoid it ending up
  // in browser bundles, but we want it in our bundle, which runs in node.
  return code.replace(`eval("require")("kleur")`, `require("kleur")`);
};

exports.resolve = function resolve(id, fromFilePath) {
  if (id === "first-base") return "external:first-base";
  // optional dep of terser; not used by us
  if (id === "acorn") return "external:acorn";

  const result = kame.defaultResolver.resolve(id, fromFilePath);

  if (result === path.resolve(__dirname, "..", "rootdir.js")) {
    return "external:../rootdir.js";
  }

  return result;
};
