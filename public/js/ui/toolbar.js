/* ==========================================
   ui/toolbar.js — markdown formatting toolbar
   ========================================== */

import { state, dom } from '../state.js';
import { scheduleSave, updatePreview } from './editor.js';

function wrapSelection(before, after = before, placeholder = '') {
  const ta = dom.editor;
  const { selectionStart: s, selectionEnd: e } = ta;
  const selected = ta.value.slice(s, e) || placeholder;
  ta.setRangeText(`${before}${selected}${after}`, s, e, 'select');
  ta.focus();
  scheduleSave();
  if (state.previewMode) updatePreview();
}

function insertLinePrefix(prefix) {
  const ta = dom.editor;
  const { selectionStart: s } = ta;
  const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  const before = ta.value.slice(0, lineStart);
  const after = ta.value.slice(lineStart);
  ta.value = before + prefix + after;
  const newPos = lineStart + prefix.length + (s - lineStart);
  ta.setSelectionRange(newPos, newPos);
  ta.focus();
  scheduleSave();
  if (state.previewMode) updatePreview();
}

const ACTIONS = {
  bold:   () => wrapSelection('**', '**', 'bold text'),
  italic: () => wrapSelection('*', '*', 'italic text'),
  code:   () => wrapSelection('`', '`', 'code'),
  link:   () => wrapSelection('[', '](url)', 'link text'),
  h1:     () => insertLinePrefix('# '),
  h2:     () => insertLinePrefix('## '),
  ul:     () => insertLinePrefix('- '),
  ol:     () => insertLinePrefix('1. '),
  quote:  () => insertLinePrefix('> '),
  hr:     () => wrapSelection('\n---\n', '', ''),
};

export function initToolbar() {
  dom.mdToolbar.addEventListener('click', e => {
    const btn = e.target.closest('.md-btn');
    if (!btn) return;
    const action = ACTIONS[btn.dataset.action];
    if (action) action();
  });
}
