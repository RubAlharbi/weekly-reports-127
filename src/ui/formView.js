import { BASE_FIELDS } from '../config/baseFields.js';
import { h } from '../utils/dom.js';
import { fileNameHtml, isBlank, todayISO } from '../utils/format.js';
import { deleteDraft, loadDraft, saveDraft, storageAvailable } from '../utils/draft.js';
import { createPdf, canShareFile, downloadBlob } from '../report/pdf.js';
import { openPreview } from '../report/preview.js';
import { confirmDialog, dialog, hideLoading, showLoading, toast } from './dialogs.js';
import { numberError, renderField } from './fields.js';
import { icon } from './icons.js';

const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

// تبقى البيانات في الذاكرة فقط أثناء فتح الصفحة، وتضيع عند إغلاقها ما لم تُنزَّل أو تُحفظ كمسودة.
const sessions = new Map();

export function emptyState() {
  const base = {};
  for (const f of BASE_FIELDS) base[f.id] = f.defaultToday ? todayISO() : '';
  return { base, fields: {} };
}

function getSession(form) {
  if (!sessions.has(form.id)) sessions.set(form.id, emptyState());
  return sessions.get(form.id);
}

export function hasUnsavedData() {
  for (const state of sessions.values()) {
    if (Object.entries(state.base).some(([k, v]) => k !== 'reportDate' && !isBlank(v))) return true;
    if (Object.values(state.fields).some((v) => (Array.isArray(v) ? v.length > 0 : !isBlank(v)))) return true;
  }
  return false;
}

function makeStore(target) {
  return { get: (k) => target[k], set: (k, v) => (target[k] = v) };
}

function formatSavedAt(iso) {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-gregory', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function renderFormView(form) {
  const state = getSession(form);
  const registry = new Map();
  const view = h('div', { class: 'view view--form' });

  const register = (key, scope, field, shell) => registry.set(`${scope}:${key}`, { field, scope, ...shell });

  function validate({ strict }) {
    const errors = [];
    for (const entry of registry.values()) entry.setError(null);
    for (const [key, entry] of registry) {
      const { field, scope } = entry;
      const value = scope === 'base' ? state.base[field.id] : state.fields[field.id];
      let message = null;
      if (field.type === 'number' || field.type === 'percent') message = numberError(field, value);
      if (!message && strict && field.required && isBlank(value)) message = 'هذا الحقل مطلوب';
      if (message) errors.push({ key, entry, message });
    }
    const { weekStart, weekEnd } = state.base;
    if (weekStart && weekEnd && weekEnd < weekStart) {
      errors.push({ key: 'base:weekEnd', entry: registry.get('base:weekEnd'), message: 'تاريخ نهاية الأسبوع يجب أن يكون بعد تاريخ البداية' });
    }
    for (const { entry, message } of errors) entry.setError(message);
    if (errors.length) {
      errors[0].entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errors[0].entry.el.querySelector('input, select, textarea')?.focus({ preventScroll: true });
    }
    return errors;
  }

  async function download() {
    const errors = validate({ strict: true });
    if (errors.length) {
      toast(`لا يمكن تنزيل التقرير قبل استكمال البيانات: يوجد ${errors.length === 1 ? 'حقل واحد يحتاج' : `${errors.length} حقول تحتاج`} إلى تصحيح.`, 'error');
      return;
    }
    showLoading('جارٍ إنشاء ملف PDF…');
    try {
      const { blob, fileName, pageCount } = await createPdf(form, state, (i, n) => showLoading(`جارٍ تجهيز الصفحة ${i} من ${n}…`));
      hideLoading();
      downloadBlob(blob, fileName);
      const shareFile = canShareFile(blob, fileName);
      const pagesText = pageCount === 1 ? 'صفحة واحدة' : pageCount === 2 ? 'صفحتان' : `${pageCount} صفحات`;
      dialog({
        title: 'تم إنشاء ملف PDF بنجاح',
        body: h(
          'div',
          null,
          h('p', null, 'تم تنزيل الملف ', h('span', { class: 'file-name', html: fileNameHtml(fileName) }), ` (${pagesText}).`),
          h('p', { class: 'alert alert--warn' }, 'تنبيه: تنزيل الملف لا يعني إرسال التقرير إلى مديرة المدرسة. أرسلي الملف يدويًا عبر واتساب أو البريد الإلكتروني.'),
        ),
        actions: [
          { label: 'تنزيل مرة أخرى', class: 'btn--ghost', onClick: () => downloadBlob(blob, fileName) },
          shareFile && {
            label: 'مشاركة الملف',
            class: 'btn--soft',
            onClick: async () => {
              try {
                await navigator.share({ files: [shareFile], title: fileName });
              } catch {
                /* ألغت المستخدمة المشاركة */
              }
            },
          },
          { label: 'حسنًا', value: true, class: 'btn--primary' },
        ].filter(Boolean),
      });
    } catch (err) {
      hideLoading();
      console.error(err);
      toast('تعذر إنشاء ملف PDF. جرّبي مرة أخرى أو استخدمي زر «طباعة» من المعاينة.', 'error', 7000);
    }
  }

  async function preview() {
    const errors = validate({ strict: false });
    if (errors.length) {
      toast('يرجى تصحيح القيم غير الصحيحة المظللة باللون الأحمر قبل المعاينة.', 'error');
      return;
    }
    const missing = BASE_FIELDS.filter((f) => f.required && isBlank(state.base[f.id]));
    if (missing.length) toast(`تنبيه: لم تكتمل البيانات الأساسية (${missing.map((f) => f.label).join('، ')}).`, 'warn', 6000);
    showLoading('جارٍ تجهيز المعاينة…');
    try {
      await openPreview(form, state, { onDownload: download });
    } catch (err) {
      console.error(err);
      toast('تعذر عرض المعاينة.', 'error');
    } finally {
      hideLoading();
    }
  }

  async function clearData() {
    const hasDraft = Boolean(loadDraft(form));
    const ok = await confirmDialog({
      title: 'مسح البيانات',
      message: `سيتم مسح جميع البيانات المدخلة في «${form.title}»${hasDraft ? ' وحذف المسودة المحفوظة على هذا الجهاز' : ''}. لا يمكن التراجع عن هذه الخطوة.`,
      confirmLabel: 'نعم، امسحي البيانات',
      danger: true,
    });
    if (!ok) return;
    sessions.set(form.id, emptyState());
    if (hasDraft) deleteDraft(form);
    rerender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('تم مسح البيانات.', 'success');
  }

  async function onSaveDraft() {
    if (!storageAvailable()) {
      toast('التخزين المحلي غير متاح في هذا المتصفح.', 'error');
      return;
    }
    const sensitive = form.sections.flatMap((s) => s.fields.filter((f) => f.sensitive).map((f) => f.label));
    const ok = await confirmDialog({
      title: 'حفظ مسودة على هذا الجهاز',
      message: h(
        'div',
        null,
        h('p', null, 'ستُحفظ المسودة في متصفح هذا الجهاز فقط، ولا تُرسل إلى أي جهة.'),
        h('p', { class: 'alert alert--warn' }, 'التخزين المحلي غير آمن للبيانات الحساسة؛ قد يطلع عليها من يستخدم الجهاز نفسه، وقد تُحذف عند مسح بيانات المتصفح.'),
        sensitive.length
          ? h('p', { class: 'muted' }, `لحماية الخصوصية لن تُحفظ البنود التالية: ${sensitive.join('، ')}.`)
          : null,
      ),
      confirmLabel: 'حفظ المسودة',
    });
    if (!ok) return;
    try {
      saveDraft(form, state);
      toast('تم حفظ المسودة على هذا الجهاز.', 'success');
      rerender();
    } catch {
      toast('تعذر حفظ المسودة.', 'error');
    }
  }

  function restoreDraft(draft) {
    const next = emptyState();
    Object.assign(next.base, draft.base || {});
    Object.assign(next.fields, draft.fields || {});
    sessions.set(form.id, next);
    rerender();
    toast('تمت استعادة المسودة.', 'success');
  }

  function draftBanner() {
    const draft = loadDraft(form);
    if (!draft) return null;
    return h(
      'div',
      { class: 'draft-banner' },
      icon('save'),
      h('p', null, 'توجد مسودة محفوظة على هذا الجهاز بتاريخ ', h('bdi', null, formatSavedAt(draft.savedAt)), '.'),
      h(
        'div',
        { class: 'draft-banner__actions' },
        h('button', { type: 'button', class: 'btn btn--soft btn--sm', onclick: () => restoreDraft(draft) }, 'استعادة المسودة'),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn--ghost btn--sm',
            onclick: async () => {
              if (await confirmDialog({ title: 'حذف المسودة', message: 'هل تريدين حذف المسودة المحفوظة على هذا الجهاز؟', confirmLabel: 'حذف', danger: true })) {
                deleteDraft(form);
                rerender();
                toast('تم حذف المسودة.', 'success');
              }
            },
          },
          'حذف',
        ),
      ),
    );
  }

  function rerender() {
    const fresh = renderFormView(form);
    view.replaceWith(fresh);
  }

  const baseStore = makeStore(state.base);
  const fieldStore = makeStore(state.fields);
  const onChange = () => {};

  const baseCard = h(
    'section',
    { class: 'card' },
    h('div', { class: 'card__head' }, h('h3', null, 'البيانات الأساسية'), h('span', { class: 'muted' }, 'الحقول المعلّمة بـ * مطلوبة للتنزيل')),
    h(
      'div',
      { class: 'grid' },
      BASE_FIELDS.map((field) => {
        const shell = renderField(field, baseStore, onChange);
        register(field.id, 'base', field, shell);
        return shell.el;
      }),
    ),
  );

  const sectionCards = form.sections.map((section, i) =>
    h(
      'section',
      { class: 'card' },
      h('div', { class: 'card__head' }, h('span', { class: 'card__index' }, String(i + 1)), h('div', null, h('p', { class: 'card__kicker' }, `القسم ${ORDINALS[i] || i + 1}`), h('h3', null, section.title))),
      h(
        'div',
        { class: 'grid grid--items' },
        section.fields.map((field) => {
          const shell = renderField(field, fieldStore, onChange);
          register(field.id, 'fields', field, shell);
          return shell.el;
        }),
      ),
    ),
  );

  const actions = h(
    'section',
    { class: 'actions card' },
    h(
      'div',
      { class: 'actions__grid' },
      h('button', { type: 'button', class: 'btn btn--soft', onclick: preview }, icon('eye'), 'معاينة التقرير'),
      h('button', { type: 'button', class: 'btn btn--primary', onclick: download }, icon('download'), 'تنزيل PDF'),
      h('button', { type: 'button', class: 'btn btn--danger-ghost', onclick: clearData }, icon('trash'), 'مسح البيانات'),
      h('a', { class: 'btn btn--ghost', href: '#/' }, icon('home'), 'العودة للرئيسية'),
    ),
    h('p', { class: 'actions__note' }, 'تنزيل ملف PDF لا يعني إرسال التقرير إلى المديرة؛ أرسليه يدويًا عبر واتساب أو البريد الإلكتروني. البيانات لا تُحفظ تلقائيًا وتضيع عند إغلاق الصفحة.'),
  );

  view.append(
    ...[
      h(
        'div',
        { class: 'form-top' },
        h('a', { class: 'btn btn--ghost btn--sm', href: '#/' }, icon('back'), 'العودة للرئيسية'),
        h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: onSaveDraft }, icon('save'), 'حفظ مسودة على هذا الجهاز'),
      ),
      h('section', { class: 'form-hero' }, h('div', { class: 'form-hero__icon' }, icon(form.icon)), h('div', null, h('h2', null, form.title), h('p', null, form.description))),
      draftBanner(),
      baseCard,
      ...sectionCards,
      actions,
    ].filter(Boolean),
  );
  return view;
}
