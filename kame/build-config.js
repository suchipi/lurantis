// this stuff is used to build lurantis itself, not used in lurantis for bundling stuff.
const path = require("path");
const kame = require("kame");

exports.resolve = function resolve(id, fromFilePath) {
  if (id === "first-base") return "external:first-base";
  if (id === "pretty-print-error") return "external:pretty-print-error";

  // optional dep of terser; not used by us
  if (id === "acorn") return "external:acorn";

  const result = kame.defaultResolver.resolve(id, fromFilePath);

  if (result === path.resolve(__dirname, "..", "rootdir.js")) {
    return "external:../rootdir.js";
  }

  return result;
};
