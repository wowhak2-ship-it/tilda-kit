// Split a generated Tilda Kit snippet into parts.
// Our own known format: header comment, optional HTML, <style> blocks, <script> blocks.
export function parseSnippet(snippet) {
  let rest = snippet;
  let header = '';
  const hm = rest.match(/^<!--[\s\S]*?-->\s*/);
  if (hm) {
    header = hm[0].trim();
    rest = rest.slice(hm[0].length);
  }
  const css = [];
  rest = rest.replace(/<style>([\s\S]*?)<\/style>/g, (_, s) => {
    css.push(s.trim());
    return '';
  });
  const js = [];
  rest = rest.replace(/<script>([\s\S]*?)<\/script>/g, (_, s) => {
    js.push(s.trim());
    return '';
  });
  return { header, html: rest.trim(), css: css.join('\n'), js: js.join('\n') };
}
