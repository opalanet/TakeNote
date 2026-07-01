/* ==========================================
   storage.js — localStorage persistence
   ========================================== */

export const STORAGE_KEY = 'takenote_notes';
export const FOLDERS_KEY = 'takenote_folders';
export const SIDEBAR_WIDTH_KEY = 'takenote_sidebar_width';

export function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function loadFolders() {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function loadSidebarWidth() {
  const saved = parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY), 10);
  return Number.isFinite(saved) ? saved : null;
}

export function persistSidebarWidth(width) {
  localStorage.setItem(SIDEBAR_WIDTH_KEY, width);
}
