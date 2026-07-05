import { header, wrapStyle, wrapScript, targetSelector } from '../js/lib.js';

// Standard Tilda menu blocks; verified against a real site in Task 13.
const TILDA_MENUS = '.t228, .t446, .t451, .t456, .t466, .t478';

export default {
  id: 'sticky-header',
  title: 'Липкое меню при скролле',
  category: 'tweaks',
  description: 'После прокрутки меню получает фон, тень и (опц.) компактную высоту. Работает со стандартными меню Tilda.',
  insertHint: 'Вставь код в Настройки сайта → HEAD. Если меню не подхватилось автоматически — впиши ID его блока (rec123…, виден в настройках блока меню).',
  schema: [
    { key: 'threshold', type: 'range', label: 'Порог скролла, px', min: 0, max: 600, step: 20, default: 100 },
    { key: 'bg', type: 'color', label: 'Фон после скролла', default: '#ffffff' },
    { key: 'shadow', type: 'toggle', label: 'Тень', default: true },
    { key: 'compact', type: 'toggle', label: 'Компактная высота', default: true },
    { key: 'targetClass', type: 'text', label: 'Меню: ID или класс (опц.)', default: '', placeholder: 'rec123… блока меню' },
  ],
  generate(v) {
    const sel = targetSelector(v, TILDA_MENUS);
    const scrolledSel = sel.split(',').map((x) => x.trim() + '.tk-scrolled').join(', ');
    let scrolledRules = `background: ${v.bg} !important;`;
    if (v.shadow) scrolledRules += `\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12) !important;`;
    if (v.compact) scrolledRules += `\n  padding-top: 6px !important;\n  padding-bottom: 6px !important;`;
    const css = `${sel} {
  transition: all 300ms ease;
}
${scrolledSel} {
  ${scrolledRules}
}`;
    const js = `
    var menu = document.querySelector('${sel}');
    if (!menu) return;
    function onScroll() {
      menu.classList.toggle('tk-scrolled', window.pageYOffset > ${v.threshold});
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();`;
    return `${header(this.title)}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<div class="t228" style="position:fixed;top:0;left:0;right:0;padding:20px 30px;font-weight:bold;background:transparent;">Меню сайта</div>
<div style="height:1200px;padding-top:90px;color:#888;">Прокрути превью вниз — у меню появится фон и тень…</div>`;
  },
};
