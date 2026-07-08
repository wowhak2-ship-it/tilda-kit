import { header, wrapScript, targetSelectorSingle } from '../js/lib.js';

export default {
  id: 'counters',
  title: 'Анимация цифр',
  category: 'effects',
  description: 'Числа в тексте «набегают» от нуля при появлении на экране. Работает с текстами стандартных блоков и Zero Block.',
  insertHint: 'В Zero Block задай текстовому элементу с числом класс (поле «CSS-КЛАСС», по умолчанию counter). Вставь код в T123 или HEAD. Префиксы/суффиксы («+», «%», «м²») сохраняются.',
  schema: [
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 500, max: 3000, step: 100, default: 1500 },
    { key: 'targetClass', type: 'text', label: 'Цель: класс или ID', default: 'counter', placeholder: 'класс из Zero / rec123…' },
  ],
  generate(v) {
    const sel = targetSelectorSingle(v, '.counter');
    const js = `
    var els = document.querySelectorAll('${sel}');
    function animate(el) {
      // Descend to the element that directly holds the number, so we change only
      // its text and keep styled wrappers intact. In Zero Block the font-size lives
      // on the inner .tn-atom; writing into the outer wrapper would drop it and
      // reset the size.
      var node = el;
      while (node.children.length === 1 && node.firstElementChild.textContent.trim() === node.textContent.trim()) {
        node = node.firstElementChild;
      }
      var text = node.textContent;
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
        node.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
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
    // Only class-like input works as a preview class; IDs get the default.
    const raw = (v.targetClass || '').trim().replace(/^\./, '');
    const cls = /^[a-zA-Z][\w-]*$/.test(raw) && !/^rec\d+$/i.test(raw) ? raw : 'counter';
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
