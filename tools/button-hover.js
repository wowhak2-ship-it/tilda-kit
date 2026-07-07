import { header, wrapStyle, targetSelector } from '../js/lib.js';

export default {
  id: 'button-hover',
  title: 'Эффекты кнопок',
  category: 'effects',
  description: 'Hover-эффекты для кнопок Tilda: заливка, подъём, свечение, стрелка, инверсия.',
  insertHint: 'Вставь код в блок T123 («HTML-код») или в Настройки сайта → HEAD. Для кнопки из Zero Block: выдели её → поле «CSS-КЛАСС» → задай класс (например my-btn) и впиши его в поле цели. Для обычного блока — его ID (#rec…, виден в панели блока).',
  schema: [
    { key: 'style', type: 'select', label: 'Стиль', default: 'fill-slide', options: [
      { value: 'fill-slide', label: 'Заливка слева' },
      { value: 'lift', label: 'Подъём с тенью' },
      { value: 'glow', label: 'Свечение' },
      { value: 'arrow', label: 'Стрелка →' },
      { value: 'invert', label: 'Инверсия' },
    ] },
    { key: 'color', type: 'color', label: 'Цвет эффекта', default: '#1a1a1a' },
    { key: 'textColor', type: 'color', label: 'Текст при наведении', default: '#ffffff' },
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 100, max: 1000, step: 50, default: 300 },
    { key: 'radius', type: 'range', label: 'Скругление, px', min: 0, max: 50, step: 1, default: 8 },
    { key: 'targetClass', type: 'text', label: 'Цель: класс или ID (опц.)', default: '', placeholder: 'класс из Zero / rec123…' },
  ],
  generate(v) {
    const sel = targetSelector(v, '.t-btn, .t-submit, .t142__submit', true);
    // Apply a pseudo-suffix to every selector in the comma list.
    const perSel = (s) => sel.split(',').map((x) => x.trim() + s).join(', ');
    let css = `${sel} {
  position: relative;
  overflow: hidden;
  border-radius: ${v.radius}px;
  transition: all ${v.duration}ms ease;
}`;
    switch (v.style) {
      case 'fill-slide':
        css += `
${sel} { z-index: 1; }
${perSel('::before')} {
  content: '';
  position: absolute;
  inset: 0;
  background: ${v.color};
  transform: translateX(-101%);
  transition: transform ${v.duration}ms ease;
  z-index: -1;
}
${perSel(':hover::before')} { transform: translateX(0); }
${perSel(':hover')} { color: ${v.textColor} !important; }`;
        break;
      case 'lift':
        css += `
${perSel(':hover')} {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px ${v.color}55;
}`;
        break;
      case 'glow':
        css += `
${perSel(':hover')} { box-shadow: 0 0 0 3px ${v.color}33, 0 0 18px ${v.color}88; }`;
        break;
      case 'arrow':
        css += `
${perSel('::after')} {
  content: '→';
  display: inline-block;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  vertical-align: middle;
  transition: all ${v.duration}ms ease;
}
${perSel(':hover::after')} { max-width: 1.2em; opacity: 1; margin-left: 8px; }`;
        break;
      case 'invert':
        css += `
${perSel(':hover')} {
  background: transparent !important;
  color: ${v.color} !important;
  box-shadow: inset 0 0 0 2px ${v.color};
}`;
        break;
    }
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML() {
    return `<a href="#" class="t-btn" style="display:inline-block;padding:16px 44px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:16px;">Кнопка Tilda</a>
<a href="#" class="t-btn" style="display:inline-block;margin-left:16px;padding:16px 44px;background:#eee;color:#111;text-decoration:none;font-size:16px;">Вторая кнопка</a>`;
  },
};
