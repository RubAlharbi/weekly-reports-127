import { h } from '../utils/dom.js';
import { fileNameHtml, reportFileName } from '../utils/format.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/dialogs.js';
import { buildReportPages } from './render.js';

const PAGE_PX = { w: 793.7, h: 1122.5 };

function printPages(pages, fileName) {
  const root = h('div', { id: 'print-root' }, pages.map((p) => p.cloneNode(true)));
  document.body.append(root);
  const prevTitle = document.title;
  document.title = fileName.replace(/\.pdf$/, '');
  document.documentElement.classList.add('is-printing');
  const cleanup = () => {
    document.title = prevTitle;
    document.documentElement.classList.remove('is-printing');
    root.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  try {
    window.print();
  } catch {
    cleanup();
    toast('الطباعة غير مدعومة في هذا المتصفح. استخدمي زر «تنزيل PDF».', 'error');
  }
  setTimeout(() => document.documentElement.classList.contains('is-printing') && !matchMedia('print').matches && cleanup(), 120_000);
}

/** يعرض التقرير النهائي كما سيظهر في ملف PDF. */
export async function openPreview(form, state, { onDownload }) {
  const { pages, dispose } = await buildReportPages(form, state);
  const fileName = reportFileName(form, state.base.weekNumber);

  const sheets = pages.map((page) => h('div', { class: 'preview__sheet' }, page));
  const scroller = h('div', { class: 'preview__pages' }, sheets);

  const fit = () => {
    const available = scroller.clientWidth - 24;
    const scale = Math.min(1, available / PAGE_PX.w);
    sheets.forEach((s) => {
      s.style.width = `${PAGE_PX.w * scale}px`;
      s.style.height = `${PAGE_PX.h * scale}px`;
      s.firstElementChild.style.transform = `scale(${scale})`;
    });
  };

  const close = () => {
    window.removeEventListener('resize', fit);
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    document.documentElement.classList.remove('has-modal');
  };
  const onKey = (e) => e.key === 'Escape' && close();

  const overlay = h(
    'div',
    { class: 'preview', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'معاينة التقرير' },
    h(
      'div',
      { class: 'preview__bar' },
      h(
        'div',
        { class: 'preview__title' },
        h('strong', null, 'معاينة التقرير'),
        h('span', { html: `${pages.length === 1 ? 'صفحة واحدة' : pages.length === 2 ? 'صفحتان' : `${pages.length} صفحات`} • ${fileNameHtml(fileName)}` }),
      ),
      h(
        'div',
        { class: 'preview__actions' },
        h('button', { type: 'button', class: 'btn btn--primary btn--sm', onclick: () => onDownload() }, icon('download'), 'تنزيل PDF'),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm preview__print', title: 'يفتح نافذة الطباعة ويمكن منها الحفظ بصيغة PDF', onclick: () => printPages(pages, fileName) }, icon('print'), 'طباعة'),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'إغلاق المعاينة', title: 'إغلاق', onclick: close }, icon('close')),
      ),
    ),
    scroller,
  );

  dispose();
  document.body.append(overlay);
  document.documentElement.classList.add('has-modal');
  window.addEventListener('resize', fit);
  document.addEventListener('keydown', onKey);
  fit();
  return { close };
}
