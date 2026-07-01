/* ==========================================
   ui/resize.js — drag-to-resize sidebar (desktop only)
   ========================================== */

import { dom, isMobile } from '../state.js';
import { loadSidebarWidth, persistSidebarWidth } from '../storage.js';

const MIN_WIDTH = 180;
const MAX_WIDTH = 400;

export function initSidebarResize() {
  if (isMobile()) return; // No resize on mobile — sidebar is a fixed overlay

  const savedWidth = loadSidebarWidth();
  if (savedWidth && savedWidth >= MIN_WIDTH && savedWidth <= MAX_WIDTH) {
    dom.sidebar.style.width = savedWidth + 'px';
    dom.sidebar.style.minWidth = savedWidth + 'px';
  }

  const handle = document.createElement('div');
  handle.className = 'sidebar-resize-handle';
  dom.sidebar.appendChild(handle);

  let dragging = false;
  let startX = 0;
  let startW = 0;

  handle.addEventListener('mousedown', e => {
    if (isMobile()) return;
    dragging = true;
    startX = e.clientX;
    startW = dom.sidebar.offsetWidth;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW + e.clientX - startX));
    dom.sidebar.style.width = w + 'px';
    dom.sidebar.style.minWidth = w + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      persistSidebarWidth(dom.sidebar.offsetWidth);
    }
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });
}
