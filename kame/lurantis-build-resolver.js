// this is the resolver used to build lurantis itself, not the resolver used in lurantis for bundling stuff.

const path = require("path");
const kame = require("kame");

exports.interfaceVersion = 2;

exports.resolve = function resolve(id, fromFilePath) {
  if (id === "first-base") return "external:first-base";

  const result = kame.defaultResolver(id, fromFilePath);

  if (result === path.resolve(__dirname, "..", "rootdir.js")) {
    return "external:../rootdir.js";
  }

  return result;
};
