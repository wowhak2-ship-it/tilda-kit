import { tools, categories } from './registry.js';
import { defaults } from './lib.js';

const els = {
  nav: document.getElementById('nav'),
  toolTitle: document.getElementById('tool-title'),
  toolDesc: document.getElementById('tool-desc'),
  controls: document.getElementById('controls'),
  preview: document.getElementById('preview'),
  code: document.getElementById('code'),
  copyBtn: document.getElementById('copy-btn'),
  insertHint: document.getElementById('insert-hint'),
  presetName: document.getElementById('preset-name'),
  presetSave: document.getElementById('preset-save'),
  presetList: document.getElementById('preset-list'),
};

let current = null; // active tool module
let values = {};    // current settings

// --- navigation ---
function renderNav() {
  els.nav.innerHTML = '';
  for (const cat of categories) {
    const items = tools.filter((t) => t.category === cat.id);
    if (!items.length) continue;
    const h = document.createElement('div');
    h.className = 'nav-cat';
    h.textContent = cat.title;
    els.nav.appendChild(h);
    for (const t of items) {
      const b = document.createElement('button');
      b.className = 'nav-item';
      b.textContent = t.title;
      b.dataset.id = t.id;
      b.onclick = () => selectTool(t.id);
      els.nav.appendChild(b);
    }
  }
}

function selectTool(id) {
  current = tools.find((t) => t.id === id);
  values = defaults(current.schema);
  document.querySelectorAll('.nav-item').forEach((b) =>
    b.classList.toggle('active', b.dataset.id === id));
  els.toolTitle.textContent = current.title;
  els.toolDesc.textContent = current.description;
  els.insertHint.textContent = current.insertHint;
  renderControls();
  renderPresets();
  refresh();
}

// --- controls generated from schema ---
function renderControls() {
  els.controls.innerHTML = '';
  for (const f of current.schema) {
    const row = document.createElement('label');
    row.className = 'control';
    const title = document.createElement('span');
    title.textContent = f.label;
    row.appendChild(title);
    switch (f.type) {
      case 'range': {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = f.min; input.max = f.max; input.step = f.step || 1;
        input.value = values[f.key];
        const num = document.createElement('output');
        num.value = String(values[f.key]);
        input.oninput = () => { num.value = input.value; setValue(f.key, Number(input.value)); };
        row.appendChild(input); row.appendChild(num);
        break;
      }
      case 'color': {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = values[f.key];
        input.oninput = () => setValue(f.key, input.value);
        row.appendChild(input);
        break;
      }
      case 'select': {
        const input = document.createElement('select');
        for (const o of f.options) {
          const opt = document.createElement('option');
          opt.value = o.value; opt.textContent = o.label;
          input.appendChild(opt);
        }
        input.value = values[f.key];
        input.onchange = () => setValue(f.key, input.value);
        row.appendChild(input);
        break;
      }
      case 'toggle': {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!values[f.key];
        input.onchange = () => setValue(f.key, input.checked);
        row.appendChild(input);
        break;
      }
      case 'text': {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = values[f.key];
        input.placeholder = f.placeholder || '';
        input.oninput = () => setValue(f.key, input.value);
        row.appendChild(input);
        break;
      }
    }
    els.controls.appendChild(row);
  }
}

function setValue(key, val) { values[key] = val; refresh(); }

// --- debounced preview + code ---
let timer = null;
function refresh() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const snippet = current.generate(values);
    els.code.textContent = snippet;
    els.preview.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;padding:40px;font-family:Arial,Helvetica,sans-serif;background:#fff;min-height:100vh;box-sizing:border-box}</style>
</head><body>
${current.previewHTML(values)}
${snippet}
</body></html>`;
  }, 150);
}

// --- copy to clipboard ---
els.copyBtn.onclick = async () => {
  try {
    await navigator.clipboard.writeText(current.generate(values));
    els.copyBtn.textContent = 'Скопировано ✓';
  } catch {
    els.copyBtn.textContent = 'Ошибка копирования';
  }
  setTimeout(() => { els.copyBtn.textContent = 'Скопировать код'; }, 1500);
};

// --- presets in localStorage ---
function presetKey() { return 'tilda-kit.presets.' + current.id; }
function loadPresets() {
  try { return JSON.parse(localStorage.getItem(presetKey())) || {}; }
  catch { return {}; }
}
function renderPresets() {
  const presets = loadPresets();
  els.presetList.innerHTML = '';
  for (const name of Object.keys(presets)) {
    const row = document.createElement('div');
    row.className = 'preset';
    const load = document.createElement('button');
    load.textContent = name;
    load.title = 'Загрузить пресет';
    load.onclick = () => {
      values = { ...defaults(current.schema), ...presets[name] };
      renderControls();
      refresh();
    };
    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Удалить пресет';
    del.onclick = () => {
      const p = loadPresets();
      delete p[name];
      localStorage.setItem(presetKey(), JSON.stringify(p));
      renderPresets();
    };
    row.appendChild(load); row.appendChild(del);
    els.presetList.appendChild(row);
  }
}
els.presetSave.onclick = () => {
  const name = els.presetName.value.trim();
  if (!name) return;
  const p = loadPresets();
  p[name] = { ...values };
  localStorage.setItem(presetKey(), JSON.stringify(p));
  els.presetName.value = '';
  renderPresets();
};

// --- init ---
renderNav();
if (tools.length) selectTool(tools[0].id);
