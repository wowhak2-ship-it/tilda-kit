import { header, wrapStyle, wrapScript } from '../js/lib.js';

// Escape user text for safe embedding into HTML.
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  id: 'marquee',
  title: 'Бегущая строка',
  category: 'constructors',
  description: 'Бесконечная бегущая строка: текст, скорость, направление, пауза при наведении.',
  insertHint: 'Вставь код в блок T123 в том месте страницы, где должна быть строка. Текст меняется в поле «Текст».',
  schema: [
    { key: 'text', type: 'text', label: 'Текст', default: 'TILDA KIT — СВОЙ НАБОР ИНСТРУМЕНТОВ — ' },
    { key: 'fontSize', type: 'range', label: 'Размер шрифта, px', min: 16, max: 120, step: 2, default: 48 },
    { key: 'speed', type: 'range', label: 'Скорость, px/с', min: 20, max: 200, step: 10, default: 80 },
    { key: 'color', type: 'color', label: 'Цвет текста', default: '#1a1a1a' },
    { key: 'bg', type: 'color', label: 'Фон', default: '#ffffff' },
    { key: 'direction', type: 'select', label: 'Направление', default: 'left', options: [
      { value: 'left', label: 'Влево' },
      { value: 'right', label: 'Вправо' },
    ] },
    { key: 'pauseOnHover', type: 'toggle', label: 'Пауза при наведении', default: true },
  ],
  generate(v) {
    const text = esc(v.text);
    const html = `<div class="tk-marquee"><div class="tk-marquee__track"><span>${text}</span><span>${text}</span></div></div>`;
    let css = `.tk-marquee {
  overflow: hidden;
  background: ${v.bg};
  white-space: nowrap;
  padding: 10px 0;
}
.tk-marquee__track {
  display: inline-flex;
  animation: tk-marquee-move linear infinite;${v.direction === 'right' ? '\n  animation-direction: reverse;' : ''}
}
.tk-marquee__track span {
  font-size: ${v.fontSize}px;
  color: ${v.color};
  padding-right: 40px;
}
@keyframes tk-marquee-move {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}`;
    if (v.pauseOnHover) {
      css += `
.tk-marquee:hover .tk-marquee__track { animation-play-state: paused; }`;
    }
    // Duration derives from real track width so speed stays px/s at any font size.
    const js = `
    document.querySelectorAll('.tk-marquee').forEach(function (m) {
      var track = m.querySelector('.tk-marquee__track');
      if (!track) return;
      track.style.animationDuration = (track.scrollWidth / 2 / ${v.speed}) + 's';
    });`;
    return `${header(this.title)}\n${html}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<div style="color:#999;font-size:13px;margin-bottom:12px;">Строка ниже — сгенерированный блок:</div>`;
  },
};
