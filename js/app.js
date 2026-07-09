import { tools, categories } from './registry.js';
import { defaults } from './lib.js';
import { loadMods, saveMods, makeMod, buildMasterBlock } from './config.js';

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
  modsList: document.getElementById('mods-list'),
  modAdd: document.getElementById('mod-add'),
  modsCopy: document.getElementById('mods-copy'),
  modsCount: document.getElementById('mods-count'),
  writeBtn: document.getElementById('write-btn'),
  writeStatus: document.getElementById('write-status'),
};

let current = null; // active tool module
let values = {};    // current settings

// Running inside the Tilda editor (as an extension iframe) vs. local server.
const IS_TILDA_CTX = new URLSearchParams(location.search).get('ctx') === 'tilda';
let pickTargetKey = null; // schema key awaiting a picker result

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
        // In the Tilda editor: pick a target by clicking the object on the page.
        if (IS_TILDA_CTX && f.key === 'targetClass') {
          const pick = document.createElement('button');
          pick.type = 'button';
          pick.className = 'pick-btn';
          pick.textContent = '◎';
          pick.title = 'Выбрать объект на странице';
          pick.onclick = () => {
            pickTargetKey = f.key;
            window.parent.postMessage({ type: 'tk-pick-start' }, '*');
          };
          row.appendChild(pick);
        }
        break;
      }
    }
    els.controls.appendChild(row);
  }
}

function setValue(key, val) { values[key] = val; refresh(); }

// --- debounced preview + code (preview.html sandbox, MV3-compatible) ---
let timer = null;
function refresh() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const snippet = current.generate(values);
    els.code.textContent = snippet;
    const html = `${current.previewHTML(values)}\n${snippet}`;
    // Recreate the iframe each time: clean window, no leaked listeners/styles.
    const fresh = document.createElement('iframe');
    fresh.id = 'preview';
    fresh.title = 'Превью';
    fresh.src = 'preview.html';
    fresh.addEventListener('load', () => {
      fresh.contentWindow.postMessage({ html }, '*');
    });
    els.preview.replaceWith(fresh);
    els.preview = fresh;
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

// --- master block mods ---
let mods = [];

function renderModsList() {
  els.modsList.innerHTML = '';
  if (!mods.length) {
    const empty = document.createElement('div');
    empty.className = 'mods-empty';
    empty.textContent = 'Пусто. Настрой эффект и кликни объект пикером (◎) или нажми «+ Добавить в мастер-блок».';
    els.modsList.appendChild(empty);
  }
  for (const m of mods) {
    const row = document.createElement('div');
    row.className = 'mod';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = m.enabled;
    cb.title = 'Вкл/выкл мод';
    cb.onchange = () => { m.enabled = cb.checked; saveMods(mods); };
    const label = document.createElement('span');
    label.className = 'mod-label';
    label.textContent = `${m.title} → ${m.target || 'все'}`;
    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Удалить мод';
    del.onclick = () => {
      mods = mods.filter((x) => x.id !== m.id);
      saveMods(mods);
      renderModsList();
    };
    row.append(cb, label, del);
    els.modsList.appendChild(row);
  }
  els.modsCount.textContent = String(mods.length);
}

// Add the current tool+settings as a NEW mod. Triggered explicitly by the user
// (picking an element, or the "Добавить" button) — never on plain settings edits.
// Each call appends a separate mod; nothing is overwritten.
function addMod() {
  const mod = makeMod(current, values);
  if (!mod) {
    els.insertHint.textContent = 'Этот инструмент вставляется отдельным блоком T123 в нужное место страницы — в мастер-блок не добавляется. Используй «Скопировать код».';
    return;
  }
  mods.push(mod);
  saveMods(mods);
  renderModsList();
}

els.modAdd.onclick = addMod;

els.modsCopy.onclick = async () => {
  if (!mods.length) {
    els.modsCopy.textContent = 'Сначала добавь моды';
    setTimeout(() => { els.modsCopy.textContent = 'Скопировать мастер-блок'; }, 2000);
    return;
  }
  try {
    await navigator.clipboard.writeText(buildMasterBlock(mods));
    els.modsCopy.textContent = 'Скопировано ✓';
  } catch {
    els.modsCopy.textContent = 'Ошибка копирования';
  }
  setTimeout(() => { els.modsCopy.textContent = 'Скопировать мастер-блок'; }, 1500);
};

// --- auto-write into the Tilda editor (extension context only) ---
const WRITE_ERRORS = {
  'no-block': 'На странице нет блока T123. Добавь его один раз: Все блоки → Другое → T123 — и нажми ещё раз.',
  'no-content-button': 'Не нашёл кнопку «Контент» у блока — обнови страницу редактора.',
  'editor-not-opened': 'Редактор кода не открылся — попробуй ещё раз.',
  'tilda-api-missing': 'Функции редактора Tilda не найдены (Tilda обновилась?) — используй «Скопировать мастер-блок».',
};

if (IS_TILDA_CTX) {
  els.writeBtn.classList.remove('hidden');

  els.writeBtn.onclick = () => {
    if (!mods.length) {
      els.writeStatus.textContent = 'Пока нет эффектов: выбери инструмент и кликни объект (◎) — добавится сам, потом записывай.';
      return;
    }
    els.writeBtn.disabled = true;
    els.writeStatus.textContent = 'Записываю…';
    window.parent.postMessage({ type: 'tk-write-master', code: buildMasterBlock(mods) }, '*');
  };

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'tk-write-result') {
      els.writeBtn.disabled = false;
      if (e.data.ok) {
        els.writeStatus.textContent = '✓ Записано в блок. Нажми «Опубликовать» в Tilda.';
        // Clear the target field so the next effect starts fresh.
        if ('targetClass' in values) values.targetClass = '';
        if ('recId' in values) values.recId = '';
        renderControls();
        refresh();
      } else {
        els.writeStatus.textContent = WRITE_ERRORS[e.data.error] || ('Не получилось (' + e.data.error + ') — используй «Скопировать мастер-блок».');
      }
      return;
    }
    // Picker returned a target — fill the field and add the effect as a new mod.
    if (e.data.type === 'tk-pick-result' && pickTargetKey) {
      values[pickTargetKey] = e.data.target;
      renderControls(); // reflects the new value in the input
      addMod();
      refresh();
      pickTargetKey = null;
    }
  });
}

// Rebuild each mod's css/js from its saved params: tool fixes/updates then
// reach previously saved mods automatically the next time the panel opens.
function regenerateMods(list) {
  let changed = false;
  const fresh = list.map((m) => {
    const tool = tools.find((t) => t.id === m.tool);
    if (!tool || !m.params) return m;
    const rebuilt = makeMod(tool, m.params);
    if (!rebuilt) return m;
    if (rebuilt.css !== m.css || rebuilt.js !== m.js || rebuilt.target !== m.target) changed = true;
    return { ...m, css: rebuilt.css, js: rebuilt.js, target: rebuilt.target };
  });
  return { fresh, changed };
}

// --- init ---
renderNav();
if (tools.length) selectTool(tools[0].id);
loadMods().then((m) => {
  const { fresh, changed } = regenerateMods(m);
  mods = fresh;
  if (changed) saveMods(mods);
  renderModsList();
});
