/* ==========================================
   ui/sidebar.js — sidebar note list + search
   ========================================== */

import { state, dom } from '../state.js';
import { formatDate, notePreviewText, escHtml } from '../format.js';

export function renderSidebar(filter = '') {
  const q = filter.toLowerCase();
  const visible = state.notes.filter(n =>
    !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );

  if (visible.length === 0) {
    dom.notesList.innerHTML = `<div class="no-notes">${
      state.notes.length === 0
        ? 'No notes yet.<br>Tap <strong>+</strong> to start.'
        : 'No matches found.'
    }</div>`;
    return;
  }

  dom.notesList.innerHTML = visible.map(n => `
    <li class="note-item ${n.id === state.activeId ? 'active' : ''}" data-id="${n.id}">
      <div class="note-item-title">${escHtml(n.title || 'Untitled')}</div>
      <div class="note-item-preview">${escHtml(notePreviewText(n.content))}</div>
      <div class="note-item-date">${formatDate(n.updatedAt)}</div>
    </li>
  `).join('');
}

export function initSidebarEvents() {
  dom.notesList.addEventListener('click', e => {
    const item = e.target.closest('.note-item');
    if (item) {
      document.dispatchEvent(new CustomEvent('note:open', { detail: item.dataset.id }));
    }
  });

  dom.searchInput.addEventListener('input', () => {
    renderSidebar(dom.searchInput.value);
  });
}
