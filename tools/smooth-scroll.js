import { header, wrapScript } from '../js/lib.js';

// Easing formulas; only the chosen one is embedded into the snippet.
const EASINGS = {
  easeInOutQuad: 't < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t',
  easeOutCubic: '1 - Math.pow(1 - t, 3)',
  linear: 't',
};

export default {
  id: 'smooth-scroll',
  title: 'Плавный скролл',
  category: 'effects',
  description: 'Плавная прокрутка к якорям по клику на ссылки #якорь, с учётом фиксированного меню.',
  insertHint: 'Вставь код один раз в Настройки сайта → HEAD (действует на все якорные ссылки сайта).',
  schema: [
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 300, max: 1500, step: 100, default: 800 },
    { key: 'offset', type: 'range', label: 'Отступ сверху, px', min: 0, max: 200, step: 10, default: 0 },
    { key: 'easing', type: 'select', label: 'Ускорение', default: 'easeInOutQuad', options: [
      { value: 'easeInOutQuad', label: 'Плавный старт и финиш' },
      { value: 'easeOutCubic', label: 'Быстрый старт' },
      { value: 'linear', label: 'Равномерно' },
    ] },
  ],
  generate(v) {
    const js = `
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href').length < 2) return;
      var hash = link.getAttribute('href').slice(1);
      var target = document.getElementById(hash) || document.querySelector('a[name="' + hash + '"]');
      if (!target) return;
      e.preventDefault();
      var startY = window.pageYOffset;
      var targetY = target.getBoundingClientRect().top + startY - ${v.offset};
      var start = null;
      function ease(t) { return ${EASINGS[v.easing]}; }
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / ${v.duration});
        window.scrollTo(0, startY + (targetY - startY) * ease(t));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });`;
    return `${header(this.title)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<nav style="margin-bottom:16px;">
  <a href="#s2" style="margin-right:16px;">Вниз к секции 2 ↓</a>
</nav>
<div id="s1" style="height:600px;background:#f2f2f2;padding:20px;border-radius:8px;">Секция 1</div>
<div id="s2" style="height:600px;background:#e2ecf5;padding:20px;border-radius:8px;margin-top:16px;">
  Секция 2 — <a href="#s1">наверх ↑</a>
</div>`;
  },
};
