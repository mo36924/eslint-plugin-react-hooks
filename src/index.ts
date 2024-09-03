import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import type { ESLint } from "eslint";

const require = createRequire(import.meta.url);

const path = join(
  require.resolve("eslint-plugin-react-hooks-v5"),
  "..",
  "cjs",
  "eslint-plugin-react-hooks.development.js",
);

const code = readFileSync(path, "utf-8");

const isHook = `
function isHook(node) {
  if (node.type === "MemberExpression") {
    return _isHook(node.property);
  }
  return _isHook(node);
}
function _isHook
`;

const isMemoCallback = `
function isMemoCallback(node) {
  if (
    (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") &&
    node.parent &&
    node.parent.type === "ExportDefaultDeclaration"
  ) {
    return true;
  }
  return _isMemoCallback(node);
}
function _isMemoCallback
`;

const patchedCode = code
  .replace(/\bprocess\.env\.NODE_ENV\b/g, '"development"')
  .replace("function isHook", isHook)
  .replace("function isMemoCallback", isMemoCallback);

const module = { exports: {} };

// eslint-disable-next-line no-new-func
const fn = new Function("require", "module", "exports", patchedCode);

fn(require, module, module.exports);

export default module.exports as ESLint.Plugin;
