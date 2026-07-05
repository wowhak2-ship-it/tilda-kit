import { header, wrapScript, targetSelector } from '../js/lib.js';

export default {
  id: 'counters',
  title: 'Анимация цифр',
  category: 'effects',
  description: 'Числа в тексте «набегают» от нуля при появлении на экране. Работает с текстами стандартных блоков и Zero Block.',
  insertHint: 'Задай текстовому элементу с числом CSS-класс (по умолчанию counter) — в Zero Block это поле CSS Class Name. Вставь код в T123 или HEAD. Префиксы/суффиксы («+», «%», «м²») сохраняются.',
  schema: [
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 500, max: 3000, step: 100, default: 1500 },
    { key: 'targetClass', type: 'text', label: 'CSS-класс цели', default: 'counter' },
  ],
  generate(v) {
    const sel = targetSelector(v, '.counter');
    const js = `
    var els = document.querySelectorAll('${sel}');
    function animate(el) {
      var text = el.textContent;
      var m = text.match(/([\\d\\s]+)/);
      if (!m) return;
      var raw = m[1];
      var target = parseInt(raw.replace(/\\s/g, ''), 10);
      if (isNaN(target)) return;
      var spaced = /\\d\\s\\d/.test(raw.trim());
      var prefix = text.slice(0, m.index);
      var suffix = text.slice(m.index + raw.length);
      var start = null;
      function fmt(n) {
        var s = String(n);
        return spaced ? s.replace(/\\B(?=(\\d{3})+(?!\\d))/g, '\\u00A0') : s;
      }
      function stepFrame(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / ${v.duration});
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(stepFrame);
      }
      requestAnimationFrame(stepFrame);
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });`;
    return `${header(this.title)}\n${wrapScript(js)}`;
  },
  previewHTML(v) {
    const cls = (v.targetClass || 'counter').trim().replace(/^\./, '') || 'counter';
    const item = (num, label) => `<div style="text-align:center;">
  <div class="${cls}" style="font-size:44px;font-weight:bold;">${num}</div>
  <div style="color:#888;font-size:14px;">${label}</div>
</div>`;
    return `<div style="display:flex;gap:40px;justify-content:center;padding-top:30px;">
${item('+250', 'проектов')}
${item('1 500', 'клиентов')}
${item('97%', 'довольны')}
</div>`;
  },
};
