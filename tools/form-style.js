import { header, wrapStyle, targetSelector } from '../js/lib.js';

export default {
  id: 'form-style',
  title: 'Стилизация форм',
  category: 'tweaks',
  description: 'Единый стиль полей ввода Tilda: цвета, рамки, скругления, высота, состояние фокуса.',
  insertHint: 'Вставь код в Настройки сайта → HEAD, чтобы стиль действовал на все формы сайта.',
  schema: [
    { key: 'bg', type: 'color', label: 'Фон поля', default: '#ffffff' },
    { key: 'textColor', type: 'color', label: 'Цвет текста', default: '#1a1a1a' },
    { key: 'borderColor', type: 'color', label: 'Цвет рамки', default: '#d0d0d0' },
    { key: 'focusColor', type: 'color', label: 'Рамка в фокусе', default: '#1a1a1a' },
    { key: 'radius', type: 'range', label: 'Скругление, px', min: 0, max: 30, step: 1, default: 8 },
    { key: 'height', type: 'range', label: 'Высота поля, px', min: 40, max: 70, step: 2, default: 50 },
    { key: 'targetClass', type: 'text', label: 'Цель: класс или ID (опц.)', default: '', placeholder: 'rec123… — только одна форма' },
  ],
  generate(v) {
    const sel = targetSelector(v, '.t-input', true);
    const perSel = (s) => sel.split(',').map((x) => x.trim() + s).join(', ');
    // "textarea" must attach to the last simple selector: "#rec5 .t-input" → "#rec5 textarea.t-input".
    const textareaSel = sel.split(',').map((x) => {
      const parts = x.trim().split(/\s+/);
      parts[parts.length - 1] = 'textarea' + parts[parts.length - 1];
      return parts.join(' ');
    }).join(', ');
    const css = `${sel} {
  background: ${v.bg} !important;
  color: ${v.textColor} !important;
  border: 1px solid ${v.borderColor} !important;
  border-radius: ${v.radius}px !important;
  height: ${v.height}px !important;
  padding: 0 16px !important;
  box-shadow: none !important;
  transition: border-color 200ms ease;
}
${perSel(':focus')} {
  border-color: ${v.focusColor} !important;
  outline: none !important;
}
${perSel('::placeholder')} {
  color: ${v.textColor}99;
}
${textareaSel} {
  height: auto !important;
  min-height: ${v.height * 2}px;
  padding: 12px 16px !important;
}`;
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML() {
    return `<div style="display:flex;flex-direction:column;gap:14px;max-width:380px;">
  <input class="t-input" placeholder="Имя">
  <input class="t-input" placeholder="Email">
  <textarea class="t-input" placeholder="Комментарий" rows="3"></textarea>
</div>`;
  },
};
