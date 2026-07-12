/* ==========================================
   state.js — shared app state & DOM refs
   ========================================== */

export const state = {
  notes: [],
  folders: [],
  activeId: null,
  activeFolderId: null,   // null = "All Notes", string = folder id
  previewMode: false,
  readingMode: false,
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
  folderList:              $('folder-list'),
  notesList:               $('notes-list'),
  searchInput:             $('search-input'),
  newNoteBtn:              $('new-note-btn'),
  newFolderBtn:            $('new-folder-btn'),
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
  restoreNoteBtn:          $('restore-note-btn'),
  closeNoteBtn:            $('close-note-btn'),
  moveNoteBtn:             $('move-note-btn'),
  saveStatus:              $('save-status'),
  wordCount:               $('word-count'),
  charCount:               $('char-count'),
  lastModified:            $('last-modified'),
  toast:                   $('toast'),
  mdToolbar:               $('md-toolbar'),
  importBtn:               $('import-btn'),
  exportBtn:               $('export-btn'),
  importFileInput:         $('import-file-input'),
  // Folder modal
  folderModal:             $('folder-modal'),
  folderModalTitle:        $('folder-modal-title'),
  folderNameInput:         $('folder-name-input'),
  folderModalConfirm:      $('folder-modal-confirm'),
  folderModalCancel:       $('folder-modal-cancel'),
  // Move modal
  moveModal:               $('move-modal'),
  moveFolderList:          $('move-folder-list'),
  moveModalCancel:         $('move-modal-cancel'),
};

export function isMobile() {
  return window.innerWidth <= 640;
}
