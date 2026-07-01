/* ==========================================
   main.js — app entry point
   ========================================== */

import { state, dom, isMobile } from './state.js';
import { loadNotes } from './storage.js';
import { createNote } from './notes.js';
import { renderSidebar, initSidebarEvents } from './ui/sidebar.js';
import { openNote, setPreviewMode, initEditorEvents } from './ui/editor.js';
import { initToolbar } from './ui/toolbar.js';
import { initMobileSidebar, initSwipeGesture, closeSidebar } from './ui/mobile.js';
import { initSidebarResize } from './ui/resize.js';
import { initShortcuts } from './shortcuts.js';
import { initImportExport } from './io.js';
import { seedDemoNotes } from './seed.js';
import { showToast } from './ui/toast.js';

function handleNewNote() {
  const note = createNote();
  if (isMobile()) closeSidebar();
  openNote(note.id);
  renderSidebar(dom.searchInput.value);
  dom.noteTitle.select();
  showToast('✦ New note created');
}

function bindNewNoteButtons() {
  dom.newNoteBtn.addEventListener('click', handleNewNote);
  dom.emptyNewBtn.addEventListener('click', handleNewNote);
  dom.mobileNewNoteBtn.addEventListener('click', handleNewNote);
}

function init() {
  state.notes = loadNotes();

  bindNewNoteButtons();
  initSidebarEvents();
  initEditorEvents();
  initToolbar();
  initMobileSidebar();
  initSwipeGesture();
  initSidebarResize();
  initShortcuts(handleNewNote);
  initImportExport();

  if (state.notes.length === 0) {
    const demo = seedDemoNotes();
    renderSidebar();
    openNote(demo.id);
    setPreviewMode(true);
  } else {
    renderSidebar();
  }
}

init();
