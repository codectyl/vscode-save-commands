const vscodeMock = require("./vscode.mock.js");
const Module = require("node:module");

const originalRequire = Module.prototype.require;

Module.prototype.require = function (path) {
  if (path === "vscode") {
    return vscodeMock;
  }
  // biome-ignore lint/style/noArguments:
  return originalRequire.apply(this, arguments);
};
