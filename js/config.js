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

// Dumb runtime: applies mods from every script.tk-config on the page.
// It knows nothing about effects — new tools never require updating it.
export const RUNTIME = `<script>
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    document.querySelectorAll('script.tk-config').forEach(function (cfgEl) {
      if (cfgEl.dataset.tkDone) return;
      cfgEl.dataset.tkDone = '1';
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
      (cfg.mods || []).forEach(function (mod) {
        if (mod.enabled === false) return;
        if (mod.css) {
          var st = document.createElement('style');
          st.textContent = mod.css;
          document.head.appendChild(st);
        }
        if (mod.js) {
          var sc = document.createElement('script');
          sc.textContent = mod.js;
          document.body.appendChild(sc);
        }
      });
    });
  });
})();
<\/script>`;

export function buildMasterBlock(mods) {
  const cfg = { version: 1, mods };
  // "</script" inside JSON string values would close the tag in HTML.
  const json = JSON.stringify(cfg, null, 2).replace(/<\/script/g, '<\\/script');
  return `<!-- TILDA KIT MASTER BLOCK — не удалять -->
<script class="tk-config" type="application/json">
${json}
</script>
${RUNTIME}`;
}
