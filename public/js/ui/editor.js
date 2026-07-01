/* ==========================================
   ui/editor.js — editor pane, autosave, preview
   ========================================== */

import { state, dom, isMobile } from '../state.js';
import { getNote, updateNote, deleteNote } from '../notes.js';
import { renderMarkdown } from '../markdown.js';
import { formatDate } from '../format.js';
import { renderSidebar } from './sidebar.js';
import { closeSidebar } from './mobile.js';
import { showToast } from './toast.js';

const SAVE_DEBOUNCE_MS = 600;
const SAVE_INDICATOR_MS = 1800;

export function openNote(id) {
  const note = getNote(id);
  if (!note) return;
  state.activeId = id;

  dom.emptyState.classList.add('hidden');
  dom.editorArea.classList.remove('hidden');

  dom.noteTitle.value = note.title;
  dom.editor.value = note.content;

  dom.mobileNoteTitleDisplay.textContent = note.title || 'Untitled';

  updateFooter(note);
  updatePreview();
  renderSidebar(dom.searchInput.value);

  // On mobile: close sidebar after selecting note
  if (isMobile()) {
    closeSidebar();
  }

  dom.editor.focus();
}

export function closeEditor() {
  state.activeId = null;
  dom.mobileNoteTitleDisplay.textContent = 'TakeNote';
  dom.emptyState.classList.remove('hidden');
  dom.editorArea.classList.add('hidden');
}

export function updatePreview() {
  dom.previewContent.innerHTML = renderMarkdown(dom.editor.value);
  dom.previewContent.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

export function updateFooter(note) {
  const content = dom.editor.value;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  dom.wordCount.textContent = `${words}w`;
  dom.charCount.textContent = `${content.length}c`;
  dom.lastModified.textContent = note ? `Saved ${formatDate(note.updatedAt)}` : '';
}

export function scheduleSave() {
  dom.saveStatus.textContent = 'Saving…';
  dom.saveStatus.className = 'saving';
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    if (!state.activeId) return;
    const newTitle = dom.noteTitle.value.trim() || 'Untitled';
    updateNote(state.activeId, {
      title: newTitle,
      content: dom.editor.value,
    });
    dom.mobileNoteTitleDisplay.textContent = newTitle;
    renderSidebar(dom.searchInput.value);
    const note = getNote(state.activeId);
    updateFooter(note);
    dom.saveStatus.textContent = '✓';
    dom.saveStatus.className = 'saved';
    setTimeout(() => {
      dom.saveStatus.textContent = '';
      dom.saveStatus.className = '';
    }, SAVE_INDICATOR_MS);
  }, SAVE_DEBOUNCE_MS);
}

export function setPreviewMode(on) {
  state.previewMode = on;
  if (on) {
    dom.paneContainer.classList.add('split');
    dom.previewPane.classList.remove('hidden');
    dom.togglePreviewBtn.classList.add('active');
    updatePreview();
  } else {
    dom.paneContainer.classList.remove('split');
    dom.previewPane.classList.add('hidden');
    dom.togglePreviewBtn.classList.remove('active');
  }
}

export function initEditorEvents() {
  document.addEventListener('note:open', e => openNote(e.detail));

  dom.editor.addEventListener('input', () => {
    scheduleSave();
    if (state.previewMode) updatePreview();
    const note = getNote(state.activeId);
    updateFooter(note);
  });

  dom.noteTitle.addEventListener('input', () => {
    scheduleSave();
    dom.mobileNoteTitleDisplay.textContent = dom.noteTitle.value || 'Untitled';
  });

  dom.togglePreviewBtn.addEventListener('click', () => {
    setPreviewMode(!state.previewMode);
  });

  dom.closeNoteBtn.addEventListener('click', () => {
    closeEditor();
    renderSidebar(dom.searchInput.value);
  });

  dom.deleteNoteBtn.addEventListener('click', () => {
    if (!state.activeId) return;
    const note = getNote(state.activeId);
    const title = note?.title || 'Untitled';
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteNote(state.activeId);
    closeEditor();
    renderSidebar(dom.searchInput.value);
    showToast(`🗑 "${title}" deleted`);
  });

  // Tab inserts a 2-space indent inside the editor textarea
  dom.editor.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end } = dom.editor;
      dom.editor.setRangeText('  ', s, end, 'end');
    }
  });
}
