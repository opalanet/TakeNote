/* ==========================================
   state.js — shared app state & DOM refs
   ========================================== */

export const state = {
  notes: [],
  activeId: null,
  previewMode: false,
  saveTimer: null,
  sidebarOpen: false,
};

const $ = id => document.getElementById(id);

export const dom = {
  sidebar:                $('sidebar'),
  sidebarBackdrop:         $('sidebar-backdrop'),
  sidebarCloseBtn:         $('sidebar-close-btn'),
  hamburgerBtn:            $('hamburger-btn'),
  mobileNewNoteBtn:        $('mobile-new-note-btn'),
  mobileNoteTitleDisplay:  $('mobile-note-title-display'),
  notesList:               $('notes-list'),
  searchInput:             $('search-input'),
  newNoteBtn:              $('new-note-btn'),
  emptyState:              $('empty-state'),
  emptyNewBtn:             $('empty-new-btn'),
  editorArea:              $('editor-area'),
  noteTitle:               $('note-title'),
  editor:                  $('editor'),
  previewPane:             $('preview-pane'),
  previewContent:          $('preview-content'),
  paneContainer:           $('pane-container'),
  togglePreviewBtn:        $('toggle-preview-btn'),
  deleteNoteBtn:           $('delete-note-btn'),
  closeNoteBtn:            $('close-note-btn'),
  saveStatus:              $('save-status'),
  wordCount:               $('word-count'),
  charCount:               $('char-count'),
  lastModified:            $('last-modified'),
  toast:                   $('toast'),
  mdToolbar:               $('md-toolbar'),
  importBtn:               $('import-btn'),
  exportBtn:               $('export-btn'),
  importFileInput:         $('import-file-input'),
};

export function isMobile() {
  return window.innerWidth <= 640;
}
