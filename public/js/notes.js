/* ==========================================
   notes.js — note CRUD
   ========================================== */

import { state } from './state.js';
import { persistNotes } from './storage.js';

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
  };
  state.notes.unshift(note);
  persistNotes(state.notes);
  return note;
}

export function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  persistNotes(state.notes);
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
