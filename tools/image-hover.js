import { header, wrapStyle, targetSelector } from '../js/lib.js';

export default {
  id: 'image-hover',
  title: 'Эффекты картинок',
  category: 'effects',
  description: 'Hover-эффекты для картинок стандартных блоков и Zero Block: зум, затемнение, подъём, ч/б.',
  insertHint: 'Вставь код в HEAD (действует на картинки галерей и блоков всего сайта). Для отдельной картинки Zero Block впиши в поле цели её Element ID (Settings → Element ID). Зум красивее всего в галереях — там Tilda сама обрезает края.',
  schema: [
    { key: 'effect', type: 'select', label: 'Эффект', default: 'zoom', options: [
      { value: 'zoom', label: 'Увеличение' },
      { value: 'zoom-dark', label: 'Зум + затемнение' },
      { value: 'lift', label: 'Подъём с тенью' },
      { value: 'grayscale', label: 'Ч/б → цвет' },
    ] },
    { key: 'scale', type: 'range', label: 'Сила зума, %', min: 102, max: 130, step: 2, default: 108 },
    { key: 'duration', type: 'range', label: 'Длительность, мс', min: 200, max: 1200, step: 50, default: 500 },
    { key: 'radius', type: 'range', label: 'Скругление, px', min: 0, max: 32, step: 2, default: 0 },
    { key: 'targetClass', type: 'text', label: 'Цель: ID или класс (опц.)', default: '', placeholder: 'rec123… / ID Zero-элемента' },
  ],
  generate(v) {
    const sel = targetSelector(v, '.t-img, .t-bgimg, .tn-atom__img');
    const perSel = (s) => sel.split(',').map((x) => x.trim() + s).join(', ');
    const scale = (v.scale / 100).toFixed(2);
    let css = `${sel} {
  transition: transform ${v.duration}ms ease, filter ${v.duration}ms ease, box-shadow ${v.duration}ms ease;${v.radius ? `\n  border-radius: ${v.radius}px;` : ''}
}`;
    switch (v.effect) {
      case 'zoom':
        css += `
${perSel(':hover')} { transform: scale(${scale}); }`;
        break;
      case 'zoom-dark':
        css += `
${perSel(':hover')} { transform: scale(${scale}); filter: brightness(0.72); }`;
        break;
      case 'lift':
        css += `
${perSel(':hover')} {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.22);
}`;
        break;
      case 'grayscale':
        css += `
${sel} { filter: grayscale(1); }
${perSel(':hover')} { filter: grayscale(0); }`;
        break;
    }
    return `${header(this.title)}\n${wrapStyle(css)}`;
  },
  previewHTML() {
    const img = (src) => `<img class="t-img" src="${src}?w=400&q=60" alt="Картинка блока" style="width:46%;display:inline-block;margin-right:2%;border-radius:inherit;">`;
    return `<p style="color:#999;font-size:13px;margin:0 0 12px;">Наведи курсор на картинки:</p>
<div style="overflow:hidden;">
${img('https://images.unsplash.com/photo-1501785888041-af3ef285b470')}
${img('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05')}
</div>`;
  },
};
