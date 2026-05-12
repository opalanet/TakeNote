/* ==========================================
   TakeNote — app.js
   Obsidian-inspired Markdown note taking app
   ========================================== */

// ─── State ────────────────────────────────
const state = {
  notes: [],          // [{ id, title, content, createdAt, updatedAt }]
  activeId: null,
  previewMode: false, // false = editor only, true = split view
  saveTimer: null,
};

// ─── Storage helpers ──────────────────────
const STORAGE_KEY = 'takenote_notes';

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
}

// ─── DOM refs ─────────────────────────────
const $ = id => document.getElementById(id);

const dom = {
  sidebar:         $('sidebar'),
  notesList:       $('notes-list'),
  searchInput:     $('search-input'),
  newNoteBtn:      $('new-note-btn'),
  emptyState:      $('empty-state'),
  emptyNewBtn:     $('empty-new-btn'),
  editorArea:      $('editor-area'),
  noteTitle:       $('note-title'),
  editor:          $('editor'),
  previewPane:     $('preview-pane'),
  previewContent:  $('preview-content'),
  paneContainer:   $('pane-container'),
  togglePreviewBtn:$('toggle-preview-btn'),
  deleteNoteBtn:   $('delete-note-btn'),
  saveStatus:      $('save-status'),
  wordCount:       $('word-count'),
  charCount:       $('char-count'),
  lastModified:    $('last-modified'),
  toast:           $('toast'),
};

// ─── Markdown rendering ───────────────────
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

// Custom renderer for task lists
const renderer = new marked.Renderer();
renderer.listitem = (text) => {
  if (/^\[[ x]\]/.test(text)) {
    const checked = text.startsWith('[x]');
    const label = text.replace(/^\[[ x]\]\s*/, '');
    return `<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${label}</li>`;
  }
  return `<li>${text}</li>`;
};
marked.setOptions({ renderer });

function renderMarkdown(md) {
  return marked.parse(md || '');
}

// ─── Note CRUD ────────────────────────────
function createNote() {
  const note = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    title: 'Untitled',
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.notes.unshift(note);
  saveNotes();
  return note;
}

function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  saveNotes();
}

function updateNote(id, patch) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  Object.assign(note, patch, { updatedAt: new Date().toISOString() });
  // Move to top of list on update
  state.notes = [note, ...state.notes.filter(n => n.id !== id)];
  saveNotes();
}

function getNote(id) {
  return state.notes.find(n => n.id === id);
}

// ─── Rendering helpers ────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function notePreviewText(content) {
  return content
    .replace(/#+\s*/g, '')
    .replace(/[*_`~>\[\]!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 72) || '—';
}

// ─── Sidebar rendering ────────────────────
function renderSidebar(filter = '') {
  const q = filter.toLowerCase();
  const visible = state.notes.filter(n =>
    !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );

  if (visible.length === 0) {
    dom.notesList.innerHTML = `<div class="no-notes">${
      state.notes.length === 0
        ? 'No notes yet.<br>Press <kbd>Ctrl+N</kbd> to start.'
        : 'No matches found.'
    }</div>`;
    return;
  }

  dom.notesList.innerHTML = visible.map(n => `
    <li class="note-item ${n.id === state.activeId ? 'active' : ''}" data-id="${n.id}">
      <div class="note-item-title">${escHtml(n.title || 'Untitled')}</div>
      <div class="note-item-preview">${escHtml(notePreviewText(n.content))}</div>
      <div class="note-item-date">${formatDate(n.updatedAt)}</div>
    </li>
  `).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Editor ───────────────────────────────
function openNote(id) {
  const note = getNote(id);
  if (!note) return;
  state.activeId = id;

  dom.emptyState.classList.add('hidden');
  dom.editorArea.classList.remove('hidden');

  dom.noteTitle.value = note.title;
  dom.editor.value = note.content;

  updateFooter(note);
  updatePreview();
  renderSidebar(dom.searchInput.value);

  dom.editor.focus();
}

function closeEditor() {
  state.activeId = null;
  dom.emptyState.classList.remove('hidden');
  dom.editorArea.classList.add('hidden');
}

function updatePreview() {
  dom.previewContent.innerHTML = renderMarkdown(dom.editor.value);
  // Syntax highlight code blocks
  dom.previewContent.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

function updateFooter(note) {
  const content = dom.editor.value;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  dom.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  dom.charCount.textContent = `${content.length} char${content.length !== 1 ? 's' : ''}`;
  dom.lastModified.textContent = note ? `Saved ${formatDate(note.updatedAt)}` : '';
}

function scheduleSave() {
  dom.saveStatus.textContent = 'Saving…';
  dom.saveStatus.className = 'saving';
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    if (!state.activeId) return;
    updateNote(state.activeId, {
      title: dom.noteTitle.value.trim() || 'Untitled',
      content: dom.editor.value,
    });
    renderSidebar(dom.searchInput.value);
    const note = getNote(state.activeId);
    updateFooter(note);
    dom.saveStatus.textContent = '✓ Saved';
    dom.saveStatus.className = 'saved';
    setTimeout(() => {
      dom.saveStatus.textContent = '';
      dom.saveStatus.className = '';
    }, 1800);
  }, 600);
}

// ─── Preview toggle ───────────────────────
function setPreviewMode(on) {
  state.previewMode = on;
  if (on) {
    dom.paneContainer.classList.add('split');
    dom.previewPane.classList.remove('hidden');
    dom.togglePreviewBtn.classList.add('active');
    updatePreview();
  } else {
    dom.paneContainer.classList.remove('split');
    dom.previewPane.classList.add('hidden');
    dom.togglePreviewBtn.classList.remove('active');
  }
}

// ─── Toast ────────────────────────────────
let toastTimer;
function showToast(msg, duration = 2200) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), duration);
}

// ─── Keyboard shortcuts ───────────────────
document.addEventListener('keydown', e => {
  const ctrl = e.ctrlKey || e.metaKey;

  // Ctrl+N — new note
  if (ctrl && e.key === 'n') {
    e.preventDefault();
    handleNewNote();
  }

  // Ctrl+P — toggle preview
  if (ctrl && e.key === 'p') {
    e.preventDefault();
    if (state.activeId) setPreviewMode(!state.previewMode);
  }

  // Ctrl+F — focus search
  if (ctrl && e.key === 'f') {
    e.preventDefault();
    dom.searchInput.focus();
    dom.searchInput.select();
  }

  // Escape — blur search
  if (e.key === 'Escape') {
    dom.searchInput.blur();
  }

  // Tab in editor → insert spaces
  if (e.key === 'Tab' && document.activeElement === dom.editor) {
    e.preventDefault();
    const { selectionStart: s, selectionEnd: end } = dom.editor;
    dom.editor.setRangeText('  ', s, end, 'end');
  }
});

// ─── Markdown toolbar helpers ─────────────
function wrapSelection(before, after = before) {
  const ta = dom.editor;
  const { selectionStart: s, selectionEnd: e } = ta;
  const selected = ta.value.slice(s, e);
  ta.setRangeText(`${before}${selected}${after}`, s, e, 'select');
  ta.focus();
  scheduleSave();
  if (state.previewMode) updatePreview();
}

// ─── Event listeners ──────────────────────
function handleNewNote() {
  const note = createNote();
  openNote(note.id);
  renderSidebar(dom.searchInput.value);
  dom.noteTitle.select();
  showToast('✦ New note created');
}

dom.newNoteBtn.addEventListener('click', handleNewNote);
dom.emptyNewBtn.addEventListener('click', handleNewNote);

dom.notesList.addEventListener('click', e => {
  const item = e.target.closest('.note-item');
  if (item) openNote(item.dataset.id);
});

dom.editor.addEventListener('input', () => {
  scheduleSave();
  if (state.previewMode) updatePreview();
  const note = getNote(state.activeId);
  updateFooter(note);
});

dom.noteTitle.addEventListener('input', () => {
  scheduleSave();
});

dom.togglePreviewBtn.addEventListener('click', () => {
  setPreviewMode(!state.previewMode);
});

dom.deleteNoteBtn.addEventListener('click', () => {
  if (!state.activeId) return;
  const note = getNote(state.activeId);
  const title = note?.title || 'Untitled';
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  deleteNote(state.activeId);
  closeEditor();
  renderSidebar(dom.searchInput.value);
  showToast(`🗑 "${title}" deleted`);
});

dom.searchInput.addEventListener('input', () => {
  renderSidebar(dom.searchInput.value);
});

// ─── Drag to resize sidebar ───────────────
(function initSidebarResize() {
  const handle = document.createElement('div');
  handle.style.cssText = `
    position: absolute; top: 0; right: -3px; width: 6px; height: 100%;
    cursor: col-resize; z-index: 10;
  `;
  dom.sidebar.style.position = 'relative';
  dom.sidebar.appendChild(handle);

  let dragging = false, startX, startW;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startW = dom.sidebar.offsetWidth;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const w = Math.max(180, Math.min(400, startW + e.clientX - startX));
    dom.sidebar.style.width = w + 'px';
    dom.sidebar.style.minWidth = w + 'px';
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });
})();

// ─── Seed demo notes if first run ─────────
function seedDemoNotes() {
  const welcome = createNote();
  Object.assign(welcome, {
    title: 'Welcome to TakeNote',
    content: `# Welcome to TakeNote ◈

TakeNote is a minimal Markdown note-taking app inspired by Obsidian.

## Features

- **Live split preview** — press \`Ctrl+P\` to toggle
- **Auto-save** — your notes save as you type
- **Keyboard shortcuts** for quick actions
- **Full Markdown support** — headings, lists, code, tables, and more

## Markdown Cheatsheet

### Text Formatting
**bold**, *italic*, ~~strikethrough~~, \`inline code\`

### Lists
- Unordered list item
- Another item
  - Nested item

1. Ordered list
2. Second item

### Task Lists
- [x] Build TakeNote
- [ ] Write more notes
- [ ] Take over the world

### Code

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('world'));
\`\`\`

### Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

### Table

| Feature | Status |
|---------|--------|
| Editor | ✅ Done |
| Preview | ✅ Done |
| Search | ✅ Done |
| Shortcuts | ✅ Done |

---

Start writing your own note with **Ctrl+N** or the **+** button.
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  state.notes = [welcome];
  saveNotes();
  return welcome;
}

// ─── Init ─────────────────────────────────
function init() {
  state.notes = loadNotes();

  if (state.notes.length === 0) {
    const demo = seedDemoNotes();
    renderSidebar();
    openNote(demo.id);
    setPreviewMode(true); // show preview on first run
  } else {
    renderSidebar();
  }
}

init();

// ─── Export ───────────────────────────────
document.getElementById('export-btn').addEventListener('click', () => {
  if (state.notes.length === 0) {
    showToast('⚠ No notes to export');
    return;
  }

  const payload = {
    app: 'TakeNote',
    exportedAt: new Date().toISOString(),
    version: 1,
    notes: state.notes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `takenote-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`✦ Exported ${state.notes.length} note${state.notes.length !== 1 ? 's' : ''}`);
});

// ─── Import ───────────────────────────────
const importFileInput = document.getElementById('import-file-input');

document.getElementById('import-btn').addEventListener('click', () => {
  importFileInput.value = '';   // reset so same file can be re-imported
  importFileInput.click();
});

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Accept either a TakeNote export envelope OR a raw array of notes
      const incoming = Array.isArray(data) ? data : (data.notes ?? null);

      if (!Array.isArray(incoming)) throw new Error('Unrecognized format');

      // Validate each note has at minimum an id and content field
      const valid = incoming.filter(n => n && typeof n.id === 'string' && typeof n.content === 'string');
      if (valid.length === 0) throw new Error('No valid notes found in file');

      // Merge: incoming notes that don't already exist (by id) are prepended
      const existingIds = new Set(state.notes.map(n => n.id));
      const newNotes    = valid.filter(n => !existingIds.has(n.id));
      const dupes       = valid.length - newNotes.length;

      state.notes = [...newNotes, ...state.notes];
      saveNotes();
      renderSidebar(dom.searchInput.value);

      let msg = `✦ Imported ${newNotes.length} note${newNotes.length !== 1 ? 's' : ''}`;
      if (dupes > 0) msg += ` (${dupes} duplicate${dupes !== 1 ? 's' : ''} skipped)`;
      showToast(msg, 3000);

      // Open first imported note if nothing is active
      if (!state.activeId && newNotes.length > 0) openNote(newNotes[0].id);

    } catch (err) {
      showToast(`✖ Import failed: ${err.message}`, 3500);
    }
  };
  reader.readAsText(file);
});
