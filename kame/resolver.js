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
