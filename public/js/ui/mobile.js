/* ==========================================
   ui/mobile.js — mobile sidebar + swipe gestures
   ========================================== */

import { state, dom, isMobile } from '../state.js';

export function openSidebar() {
  state.sidebarOpen = true;
  dom.sidebar.classList.add('open');
  dom.sidebarBackdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

export function closeSidebar() {
  state.sidebarOpen = false;
  dom.sidebar.classList.remove('open');
  dom.sidebarBackdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

export function initMobileSidebar() {
  dom.hamburgerBtn.addEventListener('click', () => {
    state.sidebarOpen ? closeSidebar() : openSidebar();
  });
  dom.sidebarCloseBtn.addEventListener('click', closeSidebar);
  dom.sidebarBackdrop.addEventListener('click', closeSidebar);
}

export function initSwipeGesture() {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!isMobile()) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only trigger if horizontal swipe and touch started near left edge
    if (Math.abs(dx) > Math.abs(dy) && dx > 60 && touchStartX < 30) {
      openSidebar();
    }
    // Swipe left to close
    if (Math.abs(dx) > Math.abs(dy) && dx < -60 && state.sidebarOpen) {
      closeSidebar();
    }
  }, { passive: true });
}
