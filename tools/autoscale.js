import { header, wrapScript, targetSelectorSingle } from '../js/lib.js';

export default {
  id: 'autoscale',
  title: 'Автоскейл блока',
  category: 'tweaks',
  description: 'Пропорциональное масштабирование стандартного блока под ширину экрана — как Autoscale у Zero Block: вёрстка не перестраивается, а сжимается целиком.',
  insertHint: 'Кликни пикером ◎ стандартный блок — на узких экранах он будет масштабироваться целиком, как Zero Block в автоскейле. Цель обязательна. Эффект виден на опубликованной странице и в превью (в редакторе не показывается).',
  schema: [
    { key: 'targetClass', type: 'text', label: 'Цель: класс или ID', default: '', placeholder: 'кликни блок пикером ◎' },
    { key: 'baseWidth', type: 'range', label: 'Ширина макета, px', min: 640, max: 1600, step: 20, default: 1200 },
    { key: 'onlyShrink', type: 'toggle', label: 'Только уменьшать (не растягивать)', default: true },
  ],
  generate(v) {
    const sel = targetSelectorSingle(v, '');
    if (!sel) {
      // No target — inert snippet; preview/insertHint tell the user to pick a block.
      return `${header(this.title)}\n${wrapScript('// Укажи цель: кликни блок пикером ◎\n    return;')}`;
    }
    const js = `
    var root = document.querySelector('${sel}');
    if (!root || root.dataset.tkScale) return;
    var inner = root.firstElementChild;
    if (!inner) return;
    // A block may hold several top-level children — scale them as one piece.
    if (root.children.length > 1) {
      inner = document.createElement('div');
      while (root.firstChild) inner.appendChild(root.firstChild);
      root.appendChild(inner);
    }
    root.dataset.tkScale = '1';
    var BASE = ${v.baseWidth};
    // Pin the layout to its design width and scale it as one piece,
    // keeping it centered; the wrapper height follows the scaled content.
    root.style.overflow = 'hidden';
    inner.style.width = BASE + 'px';
    inner.style.position = 'relative';
    inner.style.left = '50%';
    inner.style.marginLeft = (-BASE / 2) + 'px';
    inner.style.transformOrigin = 'top center';
    function fit() {
      var w = root.clientWidth || window.innerWidth;
      var s = w / BASE;
      ${v.onlyShrink ? 'if (s > 1) s = 1;' : ''}
      inner.style.transform = 'scale(' + s + ')';
      root.style.height = (inner.offsetHeight * s) + 'px';
    }
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.addEventListener('load', fit);
    // Re-fit after images/fonts settle.
    setTimeout(fit, 300);
    setTimeout(fit, 1200);
    fit();`;
    return `${header(this.title)}\n${wrapScript(js)}`;
  },
  previewHTML(v) {
    // Mirror the user's target on the preview container so the snippet applies live.
    const raw = (v.targetClass || '').trim();
    let attr = '';
    const rec = raw.replace(/^#/, '');
    if (/^rec\d+$/i.test(rec)) attr = ` id="${rec}"`;
    else if (raw && /^[a-zA-Z][\w-]*$/.test(raw.replace(/^\./, ''))) attr = ` class="${raw.replace(/^\./, '')}"`;
    const card = (bg, label) => `<div style="flex:1;background:${bg};border-radius:10px;padding:28px;color:#fff;font-size:22px;">${label}</div>`;
    const note = attr
      ? `<p style="color:#999;font-size:13px;margin:0 0 12px;">Макет ниже свёрстан на ${v.baseWidth}px и сжат под окно превью целиком:</p>`
      : `<p style="color:#999;font-size:13px;margin:0 0 12px;">Это «десктопный макет» шириной ${v.baseWidth}px. Впиши цель (или кликни блок пикером ◎) — и он начнёт масштабироваться под экран.</p>`;
    return `${note}<div${attr}>
  <div style="display:flex;gap:20px;align-items:stretch;">
    ${card('#1a1a1a', 'Колонка 1')}
    ${card('#5a6b7c', 'Колонка 2')}
    ${card('#b0873f', 'Колонка 3')}
  </div>
  <p style="font-size:20px;margin-top:20px;">Текст десктопной вёрстки — при автоскейле он уменьшается пропорционально, а не переносится.</p>
</div>`;
  },
};
