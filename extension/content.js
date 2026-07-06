// Injects the TK button into the Tilda page editor and toggles the panel iframe.
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

  // Relay: panel iframe -> MAIN-world bridge (write request), bridge -> panel (result).
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (frame && e.source === frame.contentWindow && e.data.type === 'tk-write-master') {
      window.postMessage({ __tk: 'write-master', code: e.data.code }, '*');
      return;
    }
    if (e.source === window && e.data.__tk === 'write-result' && frame) {
      frame.contentWindow.postMessage({ type: 'tk-write-result', ok: e.data.ok, error: e.data.error }, '*');
    }
  });
})();
