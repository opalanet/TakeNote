/* ==========================================
   ui/toast.js — transient toast notifications
   ========================================== */

import { dom } from '../state.js';

let toastTimer;

export function showToast(msg, duration = 2200) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), duration);
}
