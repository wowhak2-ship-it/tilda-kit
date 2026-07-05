import { header, wrapStyle } from '../js/lib.js';

// Escape user text for safe embedding into HTML.
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Spinner markup + extra CSS per type.
function spinner(type, accent) {
  switch (type) {
    case 'ring':
      return {
        html: '<div class="tk-preloader__ring"></div>',
        css: `.tk-preloader__ring {
  width: 40px;
  height: 40px;
  margin-top: 22px;
  border: 3px solid ${accent}33;
  border-top-color: ${accent};
  border-radius: 50%;
  animation: tk-pre-spin 900ms linear infinite;
}
@keyframes tk-pre-spin { to { transform: rotate(360deg); } }`,
      };
    case 'dots':
      return {
        html: '<div class="tk-preloader__dots"><i></i><i></i><i></i></div>',
        css: `.tk-preloader__dots { display: flex; gap: 8px; margin-top: 22px; }
.tk-preloader__dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${accent};
  animation: tk-pre-dot 900ms ease-in-out infinite;
}
.tk-preloader__dots i:nth-child(2) { animation-delay: 150ms; }
.tk-preloader__dots i:nth-child(3) { animation-delay: 300ms; }
@keyframes tk-pre-dot { 0%, 100% { transform: scale(0.6); opacity: 0.4; } 50% { transform: scale(1); opacity: 1; } }`,
      };
    case 'bar':
      return {
        html: '<div class="tk-preloader__bar"><i></i></div>',
        css: `.tk-preloader__bar {
  width: 160px;
  height: 3px;
  margin-top: 26px;
  background: ${accent}22;
  overflow: hidden;
  border-radius: 3px;
}
.tk-preloader__bar i {
  display: block;
  width: 40%;
  height: 100%;
  background: ${accent};
  animation: tk-pre-bar 1100ms ease-in-out infinite;
}
@keyframes tk-pre-bar { from { transform: translateX(-100%); } to { transform: translateX(350%); } }`,
      };
    default:
      return { html: '', css: '' };
  }
}

export default {
  id: 'preloader',
  title: 'Прелоадер',
  category: 'constructors',
  description: 'Экран загрузки: текст/логотип и анимация, плавно исчезает после загрузки страницы.',
  insertHint: 'Вставь код в Настройки сайта → HEAD (или в T123 первым блоком страницы).',
  schema: [
    { key: 'text', type: 'text', label: 'Текст/логотип', default: 'LOADING' },
    { key: 'bg', type: 'color', label: 'Фон', default: '#ffffff' },
    { key: 'accent', type: 'color', label: 'Цвет анимации', default: '#1a1a1a' },
    { key: 'spinner', type: 'select', label: 'Анимация', default: 'ring', options: [
      { value: 'ring', label: 'Кольцо' },
      { value: 'dots', label: 'Точки' },
      { value: 'bar', label: 'Полоса' },
      { value: 'none', label: 'Только текст' },
    ] },
    { key: 'minTime', type: 'range', label: 'Мин. показ, мс', min: 0, max: 3000, step: 250, default: 800 },
  ],
  generate(v) {
    const sp = spinner(v.spinner, v.accent);
    const html = `<div id="tk-preloader"><div class="tk-preloader__text">${esc(v.text)}</div>${sp.html}</div>`;
    const css = `#tk-preloader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${v.bg};
  transition: opacity 500ms ease;
}
#tk-preloader.tk-hide { opacity: 0; pointer-events: none; }
.tk-preloader__text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  letter-spacing: 4px;
  color: ${v.accent};
}${sp.css ? '\n' + sp.css : ''}`;
    // Uses window load (not DOMContentLoaded): wait for images/fonts too.
    const js = `<script>
(function () {
  var t0 = Date.now();
  window.addEventListener('load', function () {
    var wait = Math.max(0, ${v.minTime} - (Date.now() - t0));
    setTimeout(function () {
      var p = document.getElementById('tk-preloader');
      if (p) {
        p.classList.add('tk-hide');
        setTimeout(function () { p.remove(); }, 600);
      }
    }, wait);
  });
})();
<\/script>`;
    return `${header(this.title)}\n${html}\n${wrapStyle(css)}\n${js}`;
  },
  previewHTML() {
    return `<h2 style="margin:0 0 8px;">Контент страницы</h2>
<p style="color:#666;">Прелоадер закроет этот текст и плавно исчезнет.</p>`;
  },
};
