import { header, wrapStyle, targetSelector } from '../js/lib.js';

export default {
  id: 'link-underline',
  title: 'Подчёркивания ссылок',
  category: 'effects',
  description: 'Анимированные подчёркивания текстовых ссылок: выезд, от центра, утолщение, маркер.',
  insertHint: 'Вставь код в T123 или в HEAD. По умолчанию действует на ссылки в текстовых блоках Tilda; для Zero Block впиши в поле цели Element ID элемента (Settings → Element ID).',
  schema: [
    { key: 'style', type: 'select', label: 'Стиль', default: 'slide', options: [
      { value: 'slide', label: 'Выезд слева' },
      { value: 'center', label: 'От центра' },
      { value: 'thicken', label: 'Утолщение' },
      { value: 'highlight', label: 'Маркер-подсветка' },
    ] },
    { key: 'color', type: 'color', label: 'Цвет линии', default: '#1a1a1a' },
    { key: 'thickness', type: 'range', label: 'Толщина, px', min: 1, max: 8, step: 1, default: 2 },
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 100, max: 800, step: 50, default: 300 },
    { key: 'targetClass', type: 'text', label: 'Цель: ID или класс (опц.)', default: '', placeholder: 'rec123… / ID Zero-элемента' },
  ],
  generate(v) {
    const sel = targetSelector(v, '.t-text a, .t-descr a');
    // Base/hover background-size pairs per style.
    let base = `0% ${v.thickness}px`;
    let hover = `100% ${v.thickness}px`;
    let position = '0 100%';
    let extraHover = '';
    switch (v.style) {
      case 'slide':
        break;
      case 'center':
        position = '50% 100%';
        break;
      case 'thicken':
        base = `100% ${v.thickness}px`;
        hover = `100% ${v.thickness * 3}px`;
        break;
      case 'highlight':
        base = `100% ${v.thickness}px`;
        hover = '100% 55%';
        extraHover = '\n  color: inherit;';
        break;
    }
    const css = `${sel} {
  text-decoration: none;
  padding-bottom: 2px;
  background-image: linear-gradient(${v.color}, ${v.color});
  background-repeat: no-repeat;
  background-position: ${position};
  background-size: ${base};
  transition: background-size ${v.duration}ms ease;
}
${sel.split(',').map((x) => x.trim() + ':hover').join(', ')} {
  background-size: ${hover};${extraHover}
}`;
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML() {
    return `<p class="t-text" style="font-size:18px;line-height:1.8;max-width:420px;">
Текстовый блок Tilda со <a href="#">первой ссылкой</a> в предложении,
а чуть дальше — <a href="#">вторая ссылка</a> и даже
<a href="#">третья, подлиннее остальных</a>. Наведи курсор.
</p>`;
  },
};
