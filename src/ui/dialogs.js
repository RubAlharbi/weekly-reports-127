import { h } from '../utils/dom.js';

let toastHost;

export function toast(message, type = 'success', timeout = 4500) {
  toastHost ??= document.body.appendChild(h('div', { class: 'toast-host', 'aria-live': 'polite' }));
  const el = h('div', { class: `toast toast--${type}`, role: type === 'error' ? 'alert' : 'status' }, message);
  toastHost.append(el);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  setTimeout(() => {
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 300);
  }, timeout);
}

/** نافذة حوار عامة؛ تعيد Promise بقيمة الزر الذي تم اختياره (أو null عند الإلغاء). */
export function dialog({ title, body, actions }) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const close = (value) => {
      overlay.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 200);
      previousFocus?.focus?.();
      resolve(value);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close(null);
    };
    const buttons = actions.map((a) =>
      h('button', { type: 'button', class: `btn ${a.class || 'btn--ghost'}`, onclick: () => (a.onClick ? a.onClick(close) : close(a.value)) }, a.label),
    );
    const box = h(
      'div',
      { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('h3', { class: 'dialog__title' }, title),
      h('div', { class: 'dialog__body' }, body),
      h('div', { class: 'dialog__actions' }, buttons),
    );
    const overlay = h('div', { class: 'dialog-overlay', onclick: (e) => e.target === overlay && close(null) }, box);
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      buttons[buttons.length - 1]?.focus();
    });
  });
}

export async function confirmDialog({ title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', danger = false }) {
  const result = await dialog({
    title,
    body: typeof message === 'string' ? h('p', null, message) : message,
    actions: [
      { label: cancelLabel, value: false, class: 'btn--ghost' },
      { label: confirmLabel, value: true, class: danger ? 'btn--danger' : 'btn--primary' },
    ],
  });
  return result === true;
}

let loadingEl;
export function showLoading(message) {
  loadingEl ??= h('div', { class: 'loading-overlay', role: 'status' }, h('div', { class: 'loading-box' }, h('span', { class: 'spinner' }), h('p', { class: 'loading-text' })));
  loadingEl.querySelector('.loading-text').textContent = message;
  document.body.append(loadingEl);
  requestAnimationFrame(() => loadingEl.classList.add('is-open'));
}

export function hideLoading() {
  if (!loadingEl) return;
  loadingEl.classList.remove('is-open');
  loadingEl.remove();
}
