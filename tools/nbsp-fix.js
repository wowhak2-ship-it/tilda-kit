import { header, wrapScript } from '../js/lib.js';

export default {
  id: 'nbsp-fix',
  title: 'Висячие предлоги',
  category: 'tweaks',
  description: 'Типографика: короткие предлоги и союзы («в», «на», «не»…) не остаются в конце строки — приклеиваются к следующему слову.',
  insertHint: 'Вставь код в Настройки сайта → HEAD — исправит переносы во всех текстах сайта после загрузки страницы.',
  schema: [
    { key: 'scope', type: 'select', label: 'Где исправлять', default: 'all', options: [
      { value: 'titles', label: 'Только заголовки' },
      { value: 'all', label: 'Заголовки и тексты' },
    ] },
  ],
  generate(v) {
    const sel = v.scope === 'titles'
      ? '.t-title, .t-name, .t-heading'
      : '.t-title, .t-name, .t-heading, .t-text, .t-descr, .t-card__descr';
    const js = `
    var els = document.querySelectorAll('${sel}');
    function fix(node) {
      if (node.nodeType === 3) {
        var s = node.nodeValue;
        // Run twice: handles back-to-back short words ("и в лесу").
        for (var i = 0; i < 2; i++) {
          s = s.replace(/(^|[\\s\\u00A0(«])([а-яёА-ЯЁa-zA-Z]{1,2}) /g, '$1$2\\u00A0');
        }
        if (s !== node.nodeValue) node.nodeValue = s;
        return;
      }
      if (node.nodeType === 1 && !/^(SCRIPT|STYLE)$/.test(node.tagName)) {
        for (var c = node.firstChild; c; c = c.nextSibling) fix(c);
      }
    }
    els.forEach(fix);`;
    return `${header(this.title)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<div style="max-width:240px;">
  <h3 class="t-title" style="font-size:22px;line-height:1.4;margin:0 0 10px;">Мы делаем сайты на Тильде и не только</h3>
  <p class="t-text" style="font-size:15px;line-height:1.6;color:#555;">Сузь окно превью: предлоги «на», «и», «не» больше не виснут в конце строки, а переносятся вместе со словом.</p>
</div>`;
  },
};
