const vscodeMock = require("./vscode.mock.js");
const Module = require("module");

const originalRequire = Module.prototype.require;

Module.prototype.require = function (path) {
  if (path === "vscode") {
    return vscodeMock;
  }
  return originalRequire.apply(this, arguments);
};
