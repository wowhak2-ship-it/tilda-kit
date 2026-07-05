import { header, wrapStyle, wrapScript } from '../js/lib.js';

export default {
  id: 'burger-menu',
  title: 'Бургер-меню',
  category: 'constructors',
  description: 'Фиксированная кнопка-бургер и выезжающая панель с многоуровневыми пунктами. Пункты правишь в коде.',
  insertHint: 'Вставь код в T123 (или HEAD). Пункты меню — в HTML-части кода: поменяй названия и ссылки, вложенные <ul> дают подменю.',
  schema: [
    { key: 'position', type: 'select', label: 'Сторона', default: 'right', options: [
      { value: 'right', label: 'Справа' },
      { value: 'left', label: 'Слева' },
    ] },
    { key: 'bg', type: 'color', label: 'Фон панели', default: '#141414' },
    { key: 'textColor', type: 'color', label: 'Цвет пунктов', default: '#ffffff' },
    { key: 'accent', type: 'color', label: 'Акцент (hover)', default: '#ffb020' },
    { key: 'width', type: 'range', label: 'Ширина панели, px', min: 260, max: 480, step: 10, default: 320 },
    { key: 'overlay', type: 'toggle', label: 'Затемнение фона', default: true },
  ],
  generate(v) {
    const side = v.position === 'left' ? 'left' : 'right';
    const hiddenShift = side === 'left' ? '-100%' : '100%';
    const overlayHTML = v.overlay ? `\n<div class="tk-burger-overlay"></div>` : '';
    const html = `<button class="tk-burger" aria-label="Меню"><span></span><span></span><span></span></button>${overlayHTML}
<nav class="tk-burger-panel">
  <ul>
    <li><a href="#about">О нас</a></li>
    <li class="tk-has-sub">
      <button type="button">Услуги</button>
      <ul>
        <li><a href="#design">Дизайн</a></li>
        <li><a href="#dev">Разработка</a></li>
      </ul>
    </li>
    <li><a href="#portfolio">Портфолио</a></li>
    <li><a href="#contacts">Контакты</a></li>
  </ul>
</nav>`;
    const overlayCSS = v.overlay
      ? `
.tk-burger-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 400ms ease;
  z-index: 99997;
}
.tk-burger-overlay.tk-open { opacity: 1; pointer-events: auto; }`
      : '';
    const css = `.tk-burger {
  position: fixed;
  top: 20px;
  ${side}: 20px;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: ${v.bg};
  cursor: pointer;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.tk-burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: ${v.textColor};
  transition: transform 300ms ease, opacity 300ms ease;
}
.tk-burger.tk-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.tk-burger.tk-active span:nth-child(2) { opacity: 0; }
.tk-burger.tk-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.tk-burger-panel {
  position: fixed;
  top: 0;
  ${side}: 0;
  width: ${v.width}px;
  max-width: 92vw;
  height: 100vh;
  background: ${v.bg};
  transform: translateX(${hiddenShift});
  transition: transform 400ms ease;
  z-index: 99998;
  padding: 90px 34px 34px;
  overflow-y: auto;
  box-sizing: border-box;
}
.tk-burger-panel.tk-open { transform: translateX(0); }
.tk-burger-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tk-burger-panel li { margin-bottom: 6px; }
.tk-burger-panel a, .tk-burger-panel .tk-has-sub > button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 0;
  border: 0;
  background: none;
  color: ${v.textColor};
  font-size: 20px;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 200ms ease;
}
.tk-burger-panel a:hover, .tk-burger-panel .tk-has-sub > button:hover { color: ${v.accent}; }
.tk-has-sub > button::after {
  content: '▾';
  margin-left: 8px;
  font-size: 14px;
  display: inline-block;
  transition: transform 300ms ease;
}
.tk-has-sub.tk-sub-open > button::after { transform: rotate(180deg); }
.tk-has-sub > ul {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease;
  padding-left: 18px;
}
.tk-has-sub.tk-sub-open > ul { max-height: 300px; }
.tk-has-sub > ul a { font-size: 17px; opacity: 0.85; }${overlayCSS}`;
    const js = `
    var burger = document.querySelector('.tk-burger');
    var panel = document.querySelector('.tk-burger-panel');
    var overlay = document.querySelector('.tk-burger-overlay');
    if (!burger || !panel) return;
    function toggleMenu(open) {
      burger.classList.toggle('tk-active', open);
      panel.classList.toggle('tk-open', open);
      if (overlay) overlay.classList.toggle('tk-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () {
      toggleMenu(!panel.classList.contains('tk-open'));
    });
    if (overlay) overlay.addEventListener('click', function () { toggleMenu(false); });
    panel.querySelectorAll('.tk-has-sub > button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.parentElement.classList.toggle('tk-sub-open');
      });
    });`;
    return `${header(this.title)}\n${html}\n${wrapStyle(css)}\n${wrapScript(js)}`;
  },
  previewHTML() {
    return `<h2 style="margin:0 0 8px;">Страница</h2>
<p style="color:#666;">Нажми на бургер в углу превью — выедет панель с подменю «Услуги».</p>`;
  },
};
