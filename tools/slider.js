import { header, wrapStyle, wrapScript } from '../js/lib.js';

// Placeholder images the user replaces with their own.
const SLIDES = [
  { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=70', alt: 'Горы на закате' },
  { src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=70', alt: 'Озеро и холмы' },
  { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=70', alt: 'Туманный лес' },
];

export default {
  id: 'slider',
  title: 'Слайдер-карусель',
  category: 'constructors',
  description: 'Карусель картинок/карточек: стрелки, точки, автопрокрутка, свайп. Картинки заменяешь на свои в коде.',
  insertHint: 'Вставь код в блок T123. Внутри кода — три <div class="tk-slide"> с картинками-заглушками: замени URL на свои.',
  schema: [
    { key: 'height', type: 'range', label: 'Высота, px', min: 260, max: 720, step: 20, default: 440 },
    { key: 'arrows', type: 'toggle', label: 'Стрелки', default: true },
    { key: 'dots', type: 'toggle', label: 'Точки', default: true },
    { key: 'autoplay', type: 'toggle', label: 'Автопрокрутка', default: true },
    { key: 'interval', type: 'range', label: 'Интервал, мс', min: 2000, max: 8000, step: 500, default: 4000 },
    { key: 'radius', type: 'range', label: 'Скругление, px', min: 0, max: 32, step: 2, default: 12 },
  ],
  generate(v) {
    const slides = SLIDES.map((s) => `    <div class="tk-slide"><img src="${s.src}" alt="${s.alt}"></div>`).join('\n');
    const arrows = v.arrows
      ? `\n  <button class="tk-slider__arrow tk-slider__arrow--prev" aria-label="Назад">‹</button>\n  <button class="tk-slider__arrow tk-slider__arrow--next" aria-label="Вперёд">›</button>`
      : '';
    const dots = v.dots ? `\n  <div class="tk-slider__dots"></div>` : '';
    const html = `<div class="tk-slider" data-autoplay="${v.autoplay}" data-interval="${v.interval}">
  <div class="tk-slider__viewport">
    <div class="tk-slider__track">
${slides}
    </div>
  </div>${arrows}${dots}
</div>`;
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
.tk-slide { min-width: 100%; }
.tk-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
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
    const js = `
    document.querySelectorAll('.tk-slider').forEach(function (slider) {
      var track = slider.querySelector('.tk-slider__track');
      var slides = slider.querySelectorAll('.tk-slide');
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
      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });

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

      // Autoplay with pause on hover.
      if (slider.dataset.autoplay === 'true') {
        var interval = parseInt(slider.dataset.interval, 10) || 4000;
        function start() { timer = setInterval(function () { go(index + 1); }, interval); }
        function stop() { clearInterval(timer); }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
      }

      go(0);
    });`;
    return `${header(this.title)}\n${html}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<div style="color:#999;font-size:13px;margin-bottom:12px;">Слайдер ниже — сгенерированный блок:</div>`;
  },
};
