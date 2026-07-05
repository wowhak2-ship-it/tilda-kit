import { header, wrapStyle, wrapScript } from '../js/lib.js';

export default {
  id: 'custom-cursor',
  title: 'Кастомный курсор',
  category: 'effects',
  description: 'Фирменный курсор: точка + плавно догоняющее кольцо, увеличение над ссылками и кнопками. Только десктоп.',
  insertHint: 'Вставь код в Настройки сайта → HEAD — курсор появится на всех страницах. На тачскринах не показывается.',
  schema: [
    { key: 'style', type: 'select', label: 'Вид', default: 'dot-ring', options: [
      { value: 'dot-ring', label: 'Точка + кольцо' },
      { value: 'dot', label: 'Только точка' },
      { value: 'ring', label: 'Только кольцо' },
    ] },
    { key: 'color', type: 'color', label: 'Цвет', default: '#1a1a1a' },
    { key: 'dotSize', type: 'range', label: 'Точка, px', min: 4, max: 16, step: 1, default: 8 },
    { key: 'ringSize', type: 'range', label: 'Кольцо, px', min: 24, max: 64, step: 2, default: 36 },
    { key: 'hideNative', type: 'toggle', label: 'Скрыть системный курсор', default: true },
    { key: 'hoverGrow', type: 'toggle', label: 'Увеличение на ссылках', default: true },
  ],
  generate(v) {
    const hasDot = v.style !== 'ring';
    const hasRing = v.style !== 'dot';
    let css = `@media (pointer: fine) {${v.hideNative ? `
  html, body, a, button { cursor: none !important; }` : ''}`;
    if (hasDot) {
      css += `
  .tk-cursor-dot {
    position: fixed;
    top: 0;
    left: 0;
    width: ${v.dotSize}px;
    height: ${v.dotSize}px;
    margin: -${v.dotSize / 2}px 0 0 -${v.dotSize / 2}px;
    border-radius: 50%;
    background: ${v.color};
    pointer-events: none;
    z-index: 999999;
  }`;
    }
    if (hasRing) {
      css += `
  .tk-cursor-ring {
    position: fixed;
    top: 0;
    left: 0;
    width: ${v.ringSize}px;
    height: ${v.ringSize}px;
    margin: -${v.ringSize / 2}px 0 0 -${v.ringSize / 2}px;
    border: 1.5px solid ${v.color};
    border-radius: 50%;
    pointer-events: none;
    z-index: 999998;
    transition: transform 150ms ease, opacity 150ms ease;
  }
  .tk-cursor-ring.tk-grow { transform: scale(1.6); opacity: 0.6; }`;
    }
    css += `
}`;
    const js = `
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;
    ${hasDot ? `var dot = document.createElement('div');
    dot.className = 'tk-cursor-dot';
    document.body.appendChild(dot);` : ''}
    ${hasRing ? `var ring = document.createElement('div');
    ring.className = 'tk-cursor-ring';
    document.body.appendChild(ring);` : ''}
    var x = -100, y = -100, rx = -100, ry = -100;
    document.addEventListener('pointermove', function (e) {
      x = e.clientX;
      y = e.clientY;
      ${hasDot ? `dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';` : ''}
    });
    ${hasRing ? `(function follow() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();` : ''}
    ${v.hoverGrow && hasRing ? `document.addEventListener('pointerover', function (e) {
      if (e.target.closest('a, button, .t-btn, .t-submit')) ring.classList.add('tk-grow');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('a, button, .t-btn, .t-submit')) ring.classList.remove('tk-grow');
    });` : ''}`;
    return `${header(this.title)}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<div style="height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#f6f6f4;border-radius:12px;">
  <p style="margin:0;color:#888;">Поводи мышкой в этой области</p>
  <a href="#" class="t-btn" style="display:inline-block;padding:14px 36px;background:#1a1a1a;color:#fff;text-decoration:none;">Наведи на кнопку</a>
</div>`;
  },
};
