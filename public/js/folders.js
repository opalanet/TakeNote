/* ==========================================
   folders.js — folder CRUD + storage
   ========================================== */

import { state } from './state.js';
import { persistFolders } from './storage.js';

function makeFolderId() {
  return 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function createFolder(name) {
  const folder = {
    id: makeFolderId(),
    name: name.trim() || 'New Folder',
    createdAt: new Date().toISOString(),
  };
  state.folders.push(folder);
  persistFolders(state.folders);
  return folder;
}

export function deleteFolder(id) {
  state.folders = state.folders.filter(f => f.id !== id);
  // Move notes that were in this folder back to "All Notes"
  state.notes = state.notes.map(n =>
    n.folderId === id ? { ...n, folderId: null } : n
  );
  persistFolders(state.folders);
}

export function renameFolder(id, newName) {
  const folder = state.folders.find(f => f.id === id);
  if (!folder) return;
  folder.name = newName.trim() || folder.name;
  persistFolders(state.folders);
}

export function getFolderById(id) {
  return state.folders.find(f => f.id === id) || null;
}
