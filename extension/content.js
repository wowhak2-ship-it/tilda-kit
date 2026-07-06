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
})();
