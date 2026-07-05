// Shared helpers for tool modules.

// Comment header prepended to every generated snippet.
export function header(title) {
  return `<!-- Tilda Kit — ${title} — ${new Date().toISOString().slice(0, 10)} -->`;
}

export function wrapStyle(css) {
  return `<style>\n${css.trim()}\n</style>`;
}

// Wraps JS in a DOM-ready guard: works pasted into T123 or into HEAD.
export function wrapScript(js) {
  return `<script>\n(function () {\n  function ready(fn) {\n    if (document.readyState !== 'loading') fn();\n    else document.addEventListener('DOMContentLoaded', fn);\n  }\n  ready(function () {\n${js.trim()}\n  });\n})();\n<\/script>`;
}

// Custom target class (if set) or the tool's default Tilda selector.
export function targetSelector(values, fallback) {
  const c = (values.targetClass || '').trim().replace(/^\./, '');
  return c ? '.' + c : fallback;
}

// Collect default values from a schema.
export function defaults(schema) {
  const v = {};
  for (const f of schema) v[f.key] = f.default;
  return v;
}
