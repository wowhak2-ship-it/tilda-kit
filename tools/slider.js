import { header, wrapStyle, wrapScript, targetSelectorSingle } from '../js/lib.js';

export default {
  id: 'slider',
  title: 'Слайдер-карусель',
  category: 'constructors',
  description: 'Превращает выбранный блок в карусель из его собственных картинок: стандартная галерея Tilda или Zero Block. Стрелки, точки, свайп, автопрокрутка.',
  insertHint: 'Кликни пикером ◎ блок галереи или Zero Block с картинками (2+) — карусель соберётся из его фото. Цель обязательна. Код — в мастер-блок (⚡) или в HEAD.',
  schema: [
    { key: 'targetClass', type: 'text', label: 'Цель: класс или ID', default: '', placeholder: 'кликни блок пикером ◎' },
    { key: 'height', type: 'range', label: 'Высота, px', min: 260, max: 720, step: 20, default: 440 },
    { key: 'arrows', type: 'toggle', label: 'Стрелки', default: true },
    { key: 'dots', type: 'toggle', label: 'Точки', default: true },
    { key: 'autoplay', type: 'toggle', label: 'Автопрокрутка', default: true },
    { key: 'interval', type: 'range', label: 'Интервал, мс', min: 2000, max: 8000, step: 500, default: 4000 },
    { key: 'radius', type: 'range', label: 'Скругление, px', min: 0, max: 32, step: 2, default: 12 },
  ],
  generate(v) {
    const sel = targetSelectorSingle(v, '');
    const css = `.tk-slider { position: relative; }
.tk-slider__viewport {
  overflow: hidden;
  border-radius: ${v.radius}px;
  height: ${v.height}px;
}
.tk-slider__track {
  display: flex;
  height: 100%;
  transition: transform 500ms ease;
}
.tk-slide { min-width: 100%; height: 100%; }
/* Reset moved tiles/elements so they fill their slide (Zero elems are absolute). */
.tk-slide > * {
  position: static !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  left: auto !important;
  top: auto !important;
}
.tk-slide .t-bgimg { background-size: cover; background-position: center; }
.tk-slide .tn-atom { width: 100% !important; height: 100% !important; }
.tk-slide img { width: 100% !important; height: 100% !important; object-fit: cover; display: block; }
.tk-slider__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
}
.tk-slider__arrow--prev { left: 16px; }
.tk-slider__arrow--next { right: 16px; }
.tk-slider__dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
}
.tk-slider__dots button {
  width: 10px;
  height: 10px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
}
.tk-slider__dots button.tk-active { background: #fff; }`;
    // Without a target there is nothing to convert — CSS-only inert snippet
    // (the preview and insertHint tell the user to pick a block).
    if (!sel) {
      return `${header(this.title)}\n${wrapStyle(css)}`;
    }
    const js = `
    var root = document.querySelector('${sel}');
    if (!root || root.dataset.tkSlider) return;
    // Collect slides from the block's own content:
    // standard gallery tiles → Zero Block image elements → plain images.
    var slides = [].slice.call(root.querySelectorAll('.t-bgimg'));
    if (slides.length < 2) slides = [].slice.call(root.querySelectorAll('.tn-elem[data-elem-type="image"]'));
    if (slides.length < 2) slides = [].slice.call(root.querySelectorAll('img'));
    if (slides.length < 2) return;
    root.dataset.tkSlider = '1';

    var slider = document.createElement('div');
    slider.className = 'tk-slider';
    slider.innerHTML = '<div class="tk-slider__viewport"><div class="tk-slider__track"></div></div>'
      ${v.arrows ? `+ '<button class="tk-slider__arrow tk-slider__arrow--prev" aria-label="Назад">‹</button><button class="tk-slider__arrow tk-slider__arrow--next" aria-label="Вперёд">›</button>'` : ''}
      ${v.dots ? `+ '<div class="tk-slider__dots"></div>'` : ''};
    var track = slider.querySelector('.tk-slider__track');

    // Build the carousel where the first slide used to be, then MOVE the
    // original nodes into it (no copies — Tilda lazyload keeps working).
    slides[0].parentNode.insertBefore(slider, slides[0]);
    slides.forEach(function (s) {
      var w = document.createElement('div');
      w.className = 'tk-slide';
      w.appendChild(s);
      track.appendChild(w);
    });

    var dotsBox = slider.querySelector('.tk-slider__dots');
    var index = 0;
    var timer = null;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      if (dotsBox) {
        dotsBox.querySelectorAll('button').forEach(function (d, di) {
          d.classList.toggle('tk-active', di === index);
        });
      }
    }

    if (dotsBox) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.setAttribute('aria-label', 'Слайд ' + (i + 1));
        d.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(d);
      });
    }

    var prev = slider.querySelector('.tk-slider__arrow--prev');
    var next = slider.querySelector('.tk-slider__arrow--next');
    if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); go(index - 1); });
    if (next) next.addEventListener('click', function (e) { e.preventDefault(); go(index + 1); });

    // Swipe support.
    var startX = null;
    slider.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    slider.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (dx > 40) go(index - 1);
      else if (dx < -40) go(index + 1);
      startX = null;
    });
${v.autoplay ? `
    // Autoplay with pause on hover.
    var interval = ${v.interval};
    function start() { timer = setInterval(function () { go(index + 1); }, interval); }
    function stop() { clearInterval(timer); }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
` : ''}
    go(0);`;
    return `${header(this.title)}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML(v) {
    // Mirror the user's target on the preview container so the snippet applies live.
    const raw = (v.targetClass || '').trim();
    let attr = '';
    const rec = raw.replace(/^#/, '');
    if (/^rec\d+$/i.test(rec)) attr = ` id="${rec}"`;
    else if (raw && /^[a-zA-Z][\w-]*$/.test(raw.replace(/^\./, ''))) attr = ` class="${raw.replace(/^\./, '')}"`;
    const tile = (img) => `<div class="t-bgimg" style="height:200px;background-image:url('https://images.unsplash.com/${img}?w=600&q=60');background-size:cover;background-position:center;"></div>`;
    const note = attr
      ? ''
      : `<p style="color:#999;font-size:13px;margin:0 0 12px;">Это «галерея-сетка». Впиши цель (или кликни блок пикером ◎) — и она станет каруселью.</p>`;
    return `${note}<div${attr} style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
${tile('photo-1501785888041-af3ef285b470')}
${tile('photo-1470071459604-3b5ec3a7fe05')}
${tile('photo-1493246507139-91e8fad9978e')}
</div>`;
  },
};
