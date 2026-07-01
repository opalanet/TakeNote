/* ==========================================
   shortcuts.js — global keyboard shortcuts
   ========================================== */

import { state, dom, isMobile } from './state.js';
import { setPreviewMode } from './ui/editor.js';
import { openSidebar, closeSidebar } from './ui/mobile.js';

export function initShortcuts(handleNewNote) {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'n') {
      e.preventDefault();
      handleNewNote();
    }

    if (ctrl && e.key === 'p') {
      e.preventDefault();
      if (state.activeId) setPreviewMode(!state.previewMode);
    }

    if (ctrl && e.key === 'f') {
      e.preventDefault();
      if (isMobile()) openSidebar();
      dom.searchInput.focus();
      dom.searchInput.select();
    }

    if (e.key === 'Escape') {
      if (state.sidebarOpen && isMobile()) {
        closeSidebar();
      } else {
        dom.searchInput.blur();
      }
    }
  });
}
