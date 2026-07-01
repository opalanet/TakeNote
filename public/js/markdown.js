/* ==========================================
   markdown.js — marked config + rendering
   ========================================== */

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

const renderer = new marked.Renderer();
renderer.listitem = (text) => {
  if (/^\[[ x]\]/.test(text)) {
    const checked = text.startsWith('[x]');
    const label = text.replace(/^\[[ x]\]\s*/, '');
    return `<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${label}</li>`;
  }
  return `<li>${text}</li>`;
};
marked.setOptions({ renderer });

/**
 * Minimal HTML sanitizer for rendered Markdown output.
 * Strips script/style/iframe/object/embed tags, on* event handler
 * attributes, and javascript: URLs. Not a full replacement for a
 * dedicated library, but closes the obvious XSS holes in untrusted
 * Markdown (e.g. imported notes) before it hits the DOM.
 */
function sanitizeHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;

  const DANGEROUS_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM']);
  const URL_ATTRS = new Set(['href', 'src']);

  const walk = (node) => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (DANGEROUS_TAGS.has(child.tagName)) {
          child.remove();
          return;
        }
        [...child.attributes].forEach(attr => {
          const name = attr.name.toLowerCase();
          const value = attr.value.trim();
          if (name.startsWith('on')) {
            child.removeAttribute(attr.name);
          } else if (URL_ATTRS.has(name) && /^\s*javascript:/i.test(value)) {
            child.removeAttribute(attr.name);
          }
        });
        walk(child);
      }
    });
  };

  walk(template.content);
  return template.innerHTML;
}

export function renderMarkdown(md) {
  return sanitizeHtml(marked.parse(md || ''));
}
