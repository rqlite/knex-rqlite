#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir, proxyTypes } = require("./lib");

(async () => {
  await rmDir(pkgDir("dist"), { force: true, recursive: true });
  spawn("npx", ["microbundle", "--target", "node", ...buildArgs(), ...args]);
  await proxyTypes();
})();
