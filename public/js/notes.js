/* ==========================================
   notes.js — note CRUD
   ========================================== */

import { state } from './state.js';
import { persistNotes } from './storage.js';

const TRASH_DAYS = 30;

function makeId() {
  return crypto.randomUUID();
}

export function createNote() {
  const note = {
    id: makeId(),
    title: 'Untitled',
    content: '',
    folderId: state.activeFolderId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
  state.notes.unshift(note);
  persistNotes(state.notes);
  return note;
}

/** Soft-delete: moves note to Trash by stamping deletedAt. */
export function deleteNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  note.deletedAt = new Date().toISOString();
  persistNotes(state.notes);
}

/** Permanently removes a note from storage. */
export function permanentlyDeleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  persistNotes(state.notes);
}

/** Restores a trashed note back to its folder. */
export function restoreNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  note.deletedAt = null;
  persistNotes(state.notes);
}

/** Removes all notes that have been in Trash for more than TRASH_DAYS days. */
export function purgeExpiredNotes() {
  const cutoff = Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000;
  const before = state.notes.length;
  state.notes = state.notes.filter(n => {
    if (!n.deletedAt) return true;
    return new Date(n.deletedAt).getTime() > cutoff;
  });
  if (state.notes.length !== before) persistNotes(state.notes);
}

/** Returns how many days remain before a trashed note is auto-deleted. */
export function daysUntilPurge(note) {
  if (!note.deletedAt) return null;
  const deletedMs = new Date(note.deletedAt).getTime();
  const expiresMs = deletedMs + TRASH_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresMs - Date.now()) / (24 * 60 * 60 * 1000)));
}

export function updateNote(id, patch) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  Object.assign(note, patch, { updatedAt: new Date().toISOString() });
  state.notes = [note, ...state.notes.filter(n => n.id !== id)];
  persistNotes(state.notes);
}

export function getNote(id) {
  return state.notes.find(n => n.id === id);
}

export function saveNotes() {
  persistNotes(state.notes);
}
