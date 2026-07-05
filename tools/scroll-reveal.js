import { header, wrapStyle, wrapScript, targetSelectorSingle } from '../js/lib.js';

// Initial transform per effect; cleared by .tk-visible.
const TRANSFORMS = {
  'fade': '',
  'slide-up': 'translateY({d}px)',
  'slide-left': 'translateX({d}px)',
  'slide-right': 'translateX(-{d}px)',
  'zoom': 'scale(0.92)',
};

export default {
  id: 'scroll-reveal',
  title: 'Появление при скролле',
  category: 'effects',
  description: 'Элементы плавно появляются при попадании в экран: fade, сдвиг, зум. Каскадная задержка для соседей.',
  insertHint: 'Впиши в поле цели Element ID элемента Zero Block (Settings → Element ID) или ID целого блока (rec123…) — он появится при прокрутке. Код вставь в T123 на этой странице или в HEAD.',
  schema: [
    { key: 'effect', type: 'select', label: 'Эффект', default: 'slide-up', options: [
      { value: 'fade', label: 'Проявление' },
      { value: 'slide-up', label: 'Сдвиг снизу' },
      { value: 'slide-left', label: 'Сдвиг справа' },
      { value: 'slide-right', label: 'Сдвиг слева' },
      { value: 'zoom', label: 'Приближение' },
    ] },
    { key: 'distance', type: 'range', label: 'Дистанция, px', min: 20, max: 120, step: 10, default: 40 },
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 300, max: 1500, step: 100, default: 800 },
    { key: 'delayStep', type: 'range', label: 'Каскад, мс', min: 0, max: 300, step: 50, default: 100 },
    { key: 'targetClass', type: 'text', label: 'Цель: ID или класс', default: 'reveal', placeholder: 'ID Zero-элемента / rec123… / класс' },
  ],
  generate(v) {
    const sel = targetSelectorSingle(v, '.reveal');
    const transform = (TRANSFORMS[v.effect] || '').replace('{d}', v.distance);
    const css = `${sel} {
  opacity: 0;${transform ? `\n  transform: ${transform};` : ''}
  transition: opacity ${v.duration}ms ease, transform ${v.duration}ms ease;
  will-change: opacity, transform;
}
${sel}.tk-visible {
  opacity: 1;
  transform: none;
}`;
    const js = `
    var items = document.querySelectorAll('${sel}');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('tk-visible'); });
      return;
    }
    var batch = 0;
    var resetTimer = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('tk-visible'); }, batch * ${v.delayStep});
        batch++;
        io.unobserve(el);
      });
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { batch = 0; }, 100);
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });`;
    return `${header(this.title)}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML(v) {
    // Only class-like input works as a preview card class; IDs get the default.
    const raw = (v.targetClass || '').trim().replace(/^\./, '');
    const cls = /^[a-zA-Z][\w-]*$/.test(raw) && !/^rec\d+$/i.test(raw) ? raw : 'reveal';
    const card = `<div class="${cls}" style="height:120px;margin:16px 0;background:#e9e9e6;border-radius:12px;"></div>`;
    return `<div style="height:340px;padding:20px;color:#888;">Прокрути превью вниз ↓</div>
${card}${card}${card}${card}`;
  },
};
