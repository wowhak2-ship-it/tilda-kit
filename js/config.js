import { parseSnippet } from './snippet-parser.js';

const params = new URLSearchParams(location.search);
const isExt = typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.local);
const KEY = 'tk.mods.' + (params.get('pageid') || 'local');

export async function loadMods() {
  if (isExt) {
    const o = await chrome.storage.local.get(KEY);
    return o[KEY] || [];
  }
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export async function saveMods(mods) {
  if (isExt) await chrome.storage.local.set({ [KEY]: mods });
  else localStorage.setItem(KEY, JSON.stringify(mods));
}

// A mod is a modifier tool applied with specific values.
// Constructor tools (snippet has an HTML part) must be pasted as their own
// T123 block — they cannot live in the master block, so return null.
export function makeMod(tool, values) {
  const parsed = parseSnippet(tool.generate(values));
  if (parsed.html) return null;
  return {
    // Random suffix: Date.now() alone collides when mods are added in the same ms.
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    tool: tool.id,
    title: tool.title,
    target: (values.targetClass || values.recId || '').trim(),
    enabled: true,
    params: { ...values },
    css: parsed.css,
    js: parsed.js,
  };
}

// External runtime hosted on jsDelivr (GitHub). The published site loads it once
// from the Header; it reads the config and applies every effect.
// Pinned to a version TAG (not @main): jsDelivr + browsers cache files 7 days, so a
// mutable @main goes stale (fix invisible for days). A version path (@v1) is immutable
// — new fix = new tag = new URL, браузер всегда берёт свежее, никогда не залипает.
// Release: git tag v2 tk-public && git push tkpub v2, then bump TK_RUNTIME_VERSION.
export const TK_RUNTIME_VERSION = 'v3';
export const TK_RUNTIME_URL = `https://cdn.jsdelivr.net/gh/wowhak2-ship-it/tilda-kit@${TK_RUNTIME_VERSION}/runtime/tk-apply.js`;

// Slim master block: one external <script> + a short config (per mod only the
// tool id + params). No per-effect code — the runtime generates it from params.
export function buildMasterBlock(mods, runtimeUrl = TK_RUNTIME_URL) {
  const slim = mods.map(({ id, tool, target, enabled, params }) => ({ id, tool, target, enabled, params }));
  const cfg = { version: 2, mods: slim };
  // "</script" inside JSON string values would close the tag in HTML.
  const json = JSON.stringify(cfg, null, 2).replace(/<\/script/g, '<\\/script');
  return `<!-- TILDA KIT MASTER BLOCK — не удалять -->
<script type="module" src="${runtimeUrl}"></script>
<script class="tk-config" type="application/json">
${json}
</script>`;
}
