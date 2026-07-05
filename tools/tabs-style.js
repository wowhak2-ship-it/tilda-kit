import { header, wrapStyle } from '../js/lib.js';

export default {
  id: 'tabs-style',
  title: 'Табы и аккордеон',
  category: 'tweaks',
  description: 'Перекраска стандартных блоков Tilda: табы (T395) и аккордеон-FAQ (T585) — акцентный цвет, текст, рамки.',
  insertHint: 'Вставь код в Настройки сайта → HEAD. Работает со стандартными блоками T395 (табы) и T585 (аккордеон) без правок самих блоков.',
  schema: [
    { key: 'accent', type: 'color', label: 'Акцент (активный)', default: '#ffb020' },
    { key: 'textColor', type: 'color', label: 'Цвет текста', default: '#1a1a1a' },
    { key: 'mutedColor', type: 'color', label: 'Неактивный текст', default: '#8a8a8a' },
    { key: 'borderColor', type: 'color', label: 'Цвет линий/рамок', default: '#e0e0e0' },
    { key: 'thickLine', type: 'toggle', label: 'Жирная линия активного таба', default: true },
  ],
  generate(v) {
    const css = `/* T395 tabs */
.t395__tab {
  color: ${v.mutedColor} !important;
  border-color: ${v.borderColor} !important;
  transition: color 200ms ease, border-color 200ms ease;
}
.t395__tab:hover { color: ${v.textColor} !important; }
.t395__tab.t395__tab_active {
  color: ${v.textColor} !important;
  border-bottom: ${v.thickLine ? '3px' : '1px'} solid ${v.accent} !important;
}
.t395__title { color: inherit !important; }

/* T585 accordion (FAQ) */
.t585__header { border-color: ${v.borderColor} !important; }
.t585__title { color: ${v.textColor} !important; transition: color 200ms ease; }
.t585__header:hover .t585__title { color: ${v.accent} !important; }
.t585__opened .t585__title { color: ${v.accent} !important; }
.t585__icon svg,
.t585__lines { stroke: ${v.accent} !important; }
.t585__icon svg line,
.t585__icon svg path { stroke: ${v.accent} !important; }
.t585__text { color: ${v.mutedColor} !important; }`;
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML(v) {
    return `<p style="color:#999;font-size:13px;margin:0 0 12px;">Имитация стандартных блоков Tilda:</p>
<div style="display:flex;gap:24px;border-bottom:1px solid #eee;margin-bottom:20px;">
  <div class="t395__tab t395__tab_active" style="padding:12px 4px;cursor:pointer;"><span class="t395__title">Активный таб</span></div>
  <div class="t395__tab" style="padding:12px 4px;cursor:pointer;"><span class="t395__title">Второй таб</span></div>
  <div class="t395__tab" style="padding:12px 4px;cursor:pointer;"><span class="t395__title">Третий</span></div>
</div>
<div class="t585__opened" style="border-bottom:1px solid #eee;padding:14px 0;">
  <div class="t585__header" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
    <span class="t585__title" style="font-size:18px;">Открытый вопрос аккордеона</span>
    <span class="t585__icon"><svg width="14" height="14" viewBox="0 0 14 14"><line x1="0" y1="7" x2="14" y2="7" stroke-width="2"/></svg></span>
  </div>
  <p class="t585__text" style="margin:10px 0 0;">Ответ на вопрос — этот текст тоже перекрашивается.</p>
</div>
<div style="border-bottom:1px solid #eee;padding:14px 0;">
  <div class="t585__header" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
    <span class="t585__title" style="font-size:18px;">Закрытый вопрос</span>
    <span class="t585__icon"><svg width="14" height="14" viewBox="0 0 14 14"><line x1="0" y1="7" x2="14" y2="7" stroke-width="2"/><line x1="7" y1="0" x2="7" y2="14" stroke-width="2"/></svg></span>
  </div>
</div>`;
  },
};
