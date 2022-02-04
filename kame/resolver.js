const kame = require("kame");

exports.interfaceVersion = 2;

exports.resolve = function resolve(id, fromFilePath) {
  if (id === "first-base") return "external:first-base";
  return kame.defaultResolver(id, fromFilePath);
};
