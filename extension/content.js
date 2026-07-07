// Injects the TK button into the Tilda page editor, toggles the panel iframe,
// relays master-block writes to the MAIN-world bridge, and runs the target picker.
(function () {
  if (document.getElementById('tk-launcher')) return;

  const pageid = new URLSearchParams(location.search).get('pageid') || '';

  const btn = document.createElement('button');
  btn.id = 'tk-launcher';
  btn.type = 'button';
  btn.textContent = 'TK';
  btn.title = 'Tilda Kit';
  document.body.appendChild(btn);

  let frame = null;
  btn.addEventListener('click', () => {
    if (frame) {
      frame.remove();
      frame = null;
      btn.classList.remove('tk-open');
      return;
    }
    frame = document.createElement('iframe');
    frame.id = 'tk-panel';
    frame.src = chrome.runtime.getURL('index.html') + '?ctx=tilda&pageid=' + encodeURIComponent(pageid);
    document.body.appendChild(frame);
    btn.classList.add('tk-open');
  });

  // --- target picker ---------------------------------------------------------
  // Turn a clicked page element into a Tilda Kit target string:
  //  - Zero Block element → its Element ID digits (tn-elem__<id>)
  //  - standard block child → the block's #rec id (tool scopes to the element type)
  function resolveTarget(el) {
    if (!el) return null;
    const zero = el.closest('[class*="tn-elem__"]');
    if (zero) {
      const m = String(zero.className).match(/tn-elem__(\d+)/);
      if (m) return { target: m[1], label: 'элемент Zero Block', node: zero };
    }
    const rec = el.closest('div.record[recordid]');
    if (rec) {
      return { target: '#rec' + rec.getAttribute('recordid'),
        label: 'блок ' + (rec.getAttribute('data-record-cod') || ''), node: rec };
    }
    return null;
  }

  let picking = false;
  let overlay = null;
  let hint = null;

  function highlight(node) {
    if (!node) { overlay.style.display = 'none'; return; }
    const r = node.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.top = r.top + 'px';
    overlay.style.left = r.left + 'px';
    overlay.style.width = r.width + 'px';
    overlay.style.height = r.height + 'px';
  }

  function onMove(e) {
    const hit = resolveTarget(e.target);
    if (hit) {
      highlight(hit.node);
      hint.textContent = 'Выбрать: ' + hit.label + ' · Esc — отмена';
    } else {
      highlight(null);
      hint.textContent = 'Наведи на объект (кнопку, фото, текст) · Esc — отмена';
    }
  }

  function onClick(e) {
    const hit = resolveTarget(e.target);
    if (!hit) return; // let non-target clicks pass (stay in pick mode)
    e.preventDefault();
    e.stopPropagation();
    if (frame) frame.contentWindow.postMessage({ type: 'tk-pick-result', target: hit.target, label: hit.label }, '*');
    stopPick();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); stopPick(); }
  }

  function startPick() {
    if (picking) return;
    picking = true;
    if (frame) frame.style.display = 'none'; // reveal the page under the panel
    btn.style.display = 'none';

    overlay = document.createElement('div');
    overlay.id = 'tk-pick-overlay';
    document.body.appendChild(overlay);

    hint = document.createElement('div');
    hint.id = 'tk-pick-hint';
    hint.textContent = 'Наведи на объект (кнопку, фото, текст) · Esc — отмена';
    document.body.appendChild(hint);

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
  }

  function stopPick() {
    picking = false;
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
    if (overlay) { overlay.remove(); overlay = null; }
    if (hint) { hint.remove(); hint = null; }
    if (frame) frame.style.display = '';
    btn.style.display = '';
  }

  // --- message relay ---------------------------------------------------------
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    // panel iframe -> here
    if (frame && e.source === frame.contentWindow) {
      if (e.data.type === 'tk-write-master') {
        window.postMessage({ __tk: 'write-master', code: e.data.code }, '*');
        return;
      }
      if (e.data.type === 'tk-pick-start') {
        startPick();
        return;
      }
    }
    // MAIN-world bridge -> here -> panel
    if (e.source === window && e.data.__tk === 'write-result' && frame) {
      frame.contentWindow.postMessage({ type: 'tk-write-result', ok: e.data.ok, error: e.data.error }, '*');
    }
  });
})();
