import { BASE_FIELDS } from '../config/baseFields.js';
import { EMPTY, escapeHtml, formatDate, formatTime, isBlank } from '../utils/format.js';
import { YES_NO_OPTIONS } from '../ui/fields.js';

const ORDINALS = ['أولًا', 'ثانيًا', 'ثالثًا', 'رابعًا', 'خامسًا', 'سادسًا', 'سابعًا', 'ثامنًا', 'تاسعًا', 'عاشرًا'];

const ITEM_COLS = [
  { label: 'م', width: 6 },
  { label: 'البند', width: 46 },
  { label: 'الإجابة', width: 48 },
];

const empty = (extra = '') => `<span class="rp-empty">${EMPTY}${extra ? ` <small>${extra}</small>` : ''}</span>`;

export function dateHtml(iso, { withHijri = true, compact = false } = {}) {
  const d = formatDate(iso);
  if (!d) return empty();
  if (compact) return `<bdi dir="ltr">${d.greg}</bdi>`;
  const hijri = withHijri && d.hijri ? `<span class="rp-hijri">${escapeHtml(d.hijri)}</span>` : '';
  return `<span class="rp-date"><span>${d.weekday}</span> <bdi dir="ltr">${d.greg}</bdi> م</span>${hijri}`;
}

function valueHtml(field, value) {
  if (isBlank(value)) return empty();
  switch (field.type) {
    case 'number':
      return `<span class="rp-num">${escapeHtml(value)}</span>`;
    case 'percent':
      return `<span class="rp-num"><bdi dir="ltr">${escapeHtml(value)}%</bdi></span>`;
    case 'date':
      return dateHtml(value);
    case 'select':
    case 'text':
      return `<span class="rp-text">${escapeHtml(value)}</span>`;
    default:
      return escapeHtml(value);
  }
}

function yesNoBadge(value) {
  const opt = YES_NO_OPTIONS.find((o) => o.value === value);
  return opt ? `<span class="rp-badge rp-badge--${opt.value}">${opt.label}</span>` : empty();
}

const SPAN_THRESHOLD = 180;

function itemRow(num, label, answer, text = null) {
  const idx = `<span class="rp-idx">${num}</span>`;
  const labelHtml = `<span class="rp-label">${escapeHtml(label)}</span>`;
  if (text && text.value.length > SPAN_THRESHOLD) {
    // النص الطويل يمتد على عرض الجدول كاملًا بدل حصره في عمود الإجابة.
    const head = (suffix = '') => `<div class="rp-span-head">${labelHtml}${suffix}</div>`;
    return {
      span: true,
      cells: [idx, ''],
      text: { ...text, cell: 1, before: head() + text.before, contBefore: head(' <small class="rp-cont">(تابع)</small>') },
    };
  }
  return { cells: [idx, labelHtml, answer], text };
}

function cellHtml(col, value) {
  if (isBlank(value)) return empty();
  if (col.type === 'date') return dateHtml(value, { compact: true });
  if (col.type === 'time') return `<bdi>${escapeHtml(formatTime(value))}</bdi>`;
  return `<span class="rp-text">${escapeHtml(value)}</span>`;
}

/** يحوّل بيانات الاستمارة إلى كتل مرتبة جاهزة للترقيم على صفحات A4. */
export function buildUnits(form, state) {
  const units = [];

  units.push({
    kind: 'info',
    pairs: BASE_FIELDS.map((f) => [f.label, f.type === 'date' ? dateHtml(state.base[f.id]) : valueHtml(f, state.base[f.id])]),
  });

  form.sections.forEach((section, si) => {
    const heading = `${ORDINALS[si] || si + 1}: ${section.title}`;
    units.push({ kind: 'heading', text: heading });
    let rows = [];
    const flush = () => {
      if (rows.length) units.push({ kind: 'table', variant: 'items', cols: ITEM_COLS, rows, continueLabel: heading });
      rows = [];
    };

    section.fields.forEach((field, fi) => {
      const num = fi + 1;
      const value = state.fields[field.id];

      if (field.type === 'table') {
        const data = (value || []).filter((r) => field.columns.some((c) => !isBlank(r[c.id])));
        if (!data.length) {
          rows.push(itemRow(num, field.label, empty('لا توجد بيانات مدخلة')));
          return;
        }
        flush();
        const sub = `${num}. ${field.label}`;
        units.push({ kind: 'subheading', text: sub });
        const scale = 94 / field.columns.reduce((s, c) => s + (c.width || 20), 0);
        units.push({
          kind: 'table',
          variant: 'grid',
          continueLabel: `${heading} – ${field.label}`,
          cols: [{ label: 'م', width: 6 }, ...field.columns.map((c) => ({ label: c.label, width: (c.width || 20) * scale }))],
          rows: data.map((r, i) => ({ cells: [`<span class="rp-idx">${i + 1}</span>`, ...field.columns.map((c) => cellHtml(c, r[c.id]))] })),
        });
        return;
      }

      if (field.type === 'textarea') {
        rows.push(isBlank(value) ? itemRow(num, field.label, empty()) : itemRow(num, field.label, '', { cell: 2, before: '', value: value.trim(), after: '' }));
        return;
      }

      if (field.type === 'yesno') {
        const note = state.fields[`${field.id}__note`];
        const showNote = field.note && value === field.note.when && !isBlank(note);
        rows.push(
          showNote
            ? itemRow(num, field.label, '', {
                cell: 2,
                before: `${yesNoBadge(value)}<div class="rp-note"><b>${escapeHtml(field.note.label)}:</b> `,
                value: note.trim(),
                after: '</div>',
              })
            : itemRow(num, field.label, yesNoBadge(value)),
        );
        return;
      }

      rows.push(itemRow(num, field.label, valueHtml(field, value)));
    });
    flush();
  });

  units.push({ kind: 'signature' });
  return units;
}
