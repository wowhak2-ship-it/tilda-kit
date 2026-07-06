// Runs in the page MAIN world: only here Tilda editor globals (ace, edrec__*) exist.
// Protocol (window.postMessage on the editor page):
//   in:  { __tk: 'write-master', code: string }
//   out: { __tk: 'write-result', ok: boolean, error?: string }
(function () {
  if (window.__tkBridgeReady) return;
  window.__tkBridgeReady = true;

  function reply(ok, error) {
    window.postMessage({ __tk: 'write-result', ok, error: error || '' }, '*');
  }

  function findT123() {
    return document.querySelector('div.record[data-record-cod="T123"]');
  }

  function findContentButton(rec) {
    // Prefer the button inside this record's own UI; fall back to a global search.
    const inRec = [...rec.querySelectorAll('button.tp-record-ui__button')]
      .find((b) => (b.textContent || '').trim() === 'Контент');
    if (inRec) return inRec;
    return [...document.querySelectorAll('button.tp-record-ui__button')]
      .find((b) => (b.textContent || '').trim() === 'Контент') || null;
  }

  function waitFor(getter, timeoutMs, cb) {
    const t0 = Date.now();
    (function poll() {
      const v = getter();
      if (v) return cb(v);
      if (Date.now() - t0 > timeoutMs) return cb(null);
      setTimeout(poll, 150);
    })();
  }

  function writeMaster(code) {
    const rec = findT123();
    if (!rec) return reply(false, 'no-block');
    const recordid = rec.getAttribute('recordid');
    if (!recordid) return reply(false, 'no-recordid');

    const openEditor = () => document.getElementById('aceeditor' + recordid);

    const proceed = (aceEl) => {
      if (!aceEl) return reply(false, 'editor-not-opened');
      // ACE and edrec__* load lazily after the form opens — wait for them too
      // (verified live: the editor element appears before its scripts arrive).
      waitFor(() => (window.ace && typeof window.edrec__sendForm === 'function') ? true : null, 5000, (ready) => {
        if (!ready) return reply(false, 'tilda-api-missing');
        try {
          window.ace.edit(aceEl).setValue(code, -1);
          window.edrec__sendForm('update', 'content');
          // Consider it done when the edit panel goes away (or after a grace period).
          waitFor(() => {
            const p = document.getElementById('editformsxl');
            return (!p || p.offsetParent === null) ? true : null;
          }, 5000, () => reply(true));
        } catch (e) {
          reply(false, 'exception: ' + e.message);
        }
      });
    };

    if (openEditor()) return proceed(openEditor());
    const btn = findContentButton(rec);
    if (!btn) return reply(false, 'no-content-button');
    btn.click();
    waitFor(openEditor, 4000, proceed);
  }

  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.__tk !== 'write-master') return;
    writeMaster(String(e.data.code || ''));
  });
})();
