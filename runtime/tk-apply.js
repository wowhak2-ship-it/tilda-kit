// Tilda Kit runtime — loaded once in the site Header via <script type="module" src>.
// Reads every <script class="tk-config"> on the page and applies its mods.
// The effect logic lives in the shared tool modules, so the master block stays short:
// a mod carries only { tool, params }, and the CSS/JS is generated here at load time.
import { tools } from '../js/registry.js';
import { parseSnippet } from '../js/snippet-parser.js';

const byId = {};
for (const t of tools) byId[t.id] = t;

function inject(css, js) {
  if (css) {
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }
  if (js) {
    const sc = document.createElement('script');
    sc.textContent = js;
    document.body.appendChild(sc);
  }
}

function applyMod(mod) {
  if (!mod || mod.enabled === false) return;
  // v1 blocks embedded css/js directly; v2 blocks carry only params → generate now.
  if (mod.css != null || mod.js != null) {
    inject(mod.css, mod.js);
    return;
  }
  const tool = byId[mod.tool];
  if (!tool) return;
  const parsed = parseSnippet(tool.generate(mod.params || {}));
  inject(parsed.css, parsed.js);
}

function run() {
  document.querySelectorAll('script.tk-config').forEach((el) => {
    if (el.dataset.tkDone) return;
    el.dataset.tkDone = '1';
    let cfg;
    try { cfg = JSON.parse(el.textContent); } catch (e) { return; }
    (cfg.mods || []).forEach(applyMod);
  });
}

if (document.readyState !== 'loading') run();
else document.addEventListener('DOMContentLoaded', run);
