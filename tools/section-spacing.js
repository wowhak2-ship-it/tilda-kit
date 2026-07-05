import { header, wrapStyle } from '../js/lib.js';

export default {
  id: 'section-spacing',
  title: 'Отступы секций',
  category: 'tweaks',
  description: 'Перекрывает вертикальные отступы стандартных блоков Tilda: у всех сразу или у одного конкретного (по ID блока).',
  insertHint: 'Вставь код в HEAD. Чтобы поменять отступы одного блока — впиши его ID (вида rec123456789): его видно в редакторе Tilda в настройках блока или в коде страницы.',
  schema: [
    { key: 'recId', type: 'text', label: 'ID блока (опц.)', default: '', placeholder: 'rec123456789 — пусто = все блоки' },
    { key: 'padTop', type: 'range', label: 'Отступ сверху, px', min: 0, max: 200, step: 5, default: 45 },
    { key: 'padBottom', type: 'range', label: 'Отступ снизу, px', min: 0, max: 200, step: 5, default: 45 },
    { key: 'mobileHalf', type: 'toggle', label: 'На мобиле — вдвое меньше', default: true },
  ],
  generate(v) {
    const id = (v.recId || '').trim().replace(/^#/, '');
    const sel = id ? `#${id}` : '.t-rec';
    let css = `${sel} {
  padding-top: ${v.padTop}px !important;
  padding-bottom: ${v.padBottom}px !important;
}`;
    if (v.mobileHalf) {
      css += `
@media (max-width: 640px) {
  ${sel} {
    padding-top: ${Math.round(v.padTop / 2)}px !important;
    padding-bottom: ${Math.round(v.padBottom / 2)}px !important;
  }
}`;
    }
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML(v) {
    const id = (v.recId || '').trim().replace(/^#/, '') || 'rec111';
    return `<p style="color:#999;font-size:13px;margin:0 0 12px;">Две «секции Tilda» — отступы задаёт сниппет:</p>
<div id="${id}" class="t-rec" style="background:#eef3f8;">
  <div style="background:#fff;border:1px dashed #b6c6d5;padding:14px;text-align:center;">Контент секции 1</div>
</div>
<div class="t-rec" style="background:#f8f1ea;">
  <div style="background:#fff;border:1px dashed #d5c4ae;padding:14px;text-align:center;">Контент секции 2</div>
</div>`;
  },
};
