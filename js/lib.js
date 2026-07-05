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

// Resolve the user's "target" input into a CSS selector.
// Regular Tilda blocks expose only an ID (#rec..., shown in the block panel);
// elements inside Zero Block can get a custom class via their "CSS-КЛАСС" field.
// Accepts:
//  - recNNN / #recNNN  → Tilda block ID (#rec...)
//  - digits (6+)       → Zero Block element ID → .tn-elem__<id> (+ atom, img)
//  - anything else     → CSS class; Tilda may put it on the element wrapper,
//                        so also cover the atom/img inside it
// Empty input falls back to the tool's default Tilda selectors.
export function targetSelector(values, fallback) {
  const raw = (values.targetClass || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (/^rec\d+$/i.test(raw)) return '#' + raw;
  let base;
  if (/^\d{6,}$/.test(raw)) base = '.tn-elem__' + raw;
  else base = '.' + raw.replace(/^\./, '');
  return `${base}, ${base} .tn-atom, ${base} .tn-atom__img`;
}

// Same resolution, but one selector per target (no atom/img expansion).
// For tools that animate/rewrite whole elements (reveal, counters) —
// the compound selector would match nested nodes twice.
export function targetSelectorSingle(values, fallback) {
  const raw = (values.targetClass || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (/^rec\d+$/i.test(raw)) return '#' + raw;
  if (/^\d{6,}$/.test(raw)) return '.tn-elem__' + raw;
  return '.' + raw.replace(/^\./, '');
}

// Collect default values from a schema.
export function defaults(schema) {
  const v = {};
  for (const f of schema) v[f.key] = f.default;
  return v;
}
