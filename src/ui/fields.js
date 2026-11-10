import { WEEK_DAYS } from '../config/school.js';
import { h, uid } from '../utils/dom.js';
import { dayName, normalizeDigits } from '../utils/format.js';
import { icon } from './icons.js';

export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'نعم' },
  { value: 'no', label: 'لا' },
  { value: 'na', label: 'لا ينطبق' },
];

/** رسالة الخطأ لحقل عددي، أو null إن كانت القيمة سليمة أو فارغة. */
export function numberError(field, value) {
  if (value === undefined || value === '') return null;
  if (field.type === 'percent') {
    if (!/^\d+(\.\d+)?$/.test(value)) return 'أدخلي نسبة صحيحة مثل 4 أو 4.5';
    if (Number(value) > 100) return 'النسبة يجب ألا تتجاوز 100';
    return null;
  }
  if (!/^\d+$/.test(value)) return 'أدخلي عددًا صحيحًا يساوي صفرًا أو أكثر';
  if (field.min !== undefined && Number(value) < field.min) return `القيمة يجب ألا تقل عن ${field.min}`;
  if (field.max !== undefined && Number(value) > field.max) return `القيمة يجب ألا تزيد على ${field.max}`;
  return null;
}

/** رسالة الخطأ لقائمة اختيار تحمل قيمة لم تعد ضمن خياراتها (مثل مسودة قديمة)، أو null. */
export function selectError(field, value) {
  if (value === undefined || value === '' || field.options.includes(value)) return null;
  return `القيمة المحفوظة «${value}» لم تعد ضمن الخيارات. اختاري ${field.label} من جديد.`;
}

function fieldShell(field, inputId, control, { wide = false } = {}) {
  const error = h('p', { class: 'field__error', id: `${inputId}-err`, 'aria-live': 'polite' });
  const el = h(
    'div',
    { class: `field field--${field.type}${wide ? ' field--wide' : ''}`, dataset: { fieldId: field.id } },
    h('label', { class: 'field__label', for: inputId }, field.label, field.required ? h('span', { class: 'field__req', 'aria-hidden': 'true' }, ' *') : null),
    field.sensitive
      ? h('p', { class: 'field__privacy', id: `${inputId}-privacy` }, 'حمايةً للأسماء وتفاصيل الحالات: يظهر هذا النص في ملف PDF عند التصدير، لكنه لا يُحفظ في المسودة ولا يُستعاد منها.')
      : null,
    control,
    field.hint ? h('p', { class: 'field__hint' }, field.hint) : null,
    error,
  );
  const setError = (message) => {
    error.textContent = message || '';
    el.classList.toggle('has-error', Boolean(message));
    el.querySelectorAll('input, select, textarea').forEach((i) => i.setAttribute('aria-invalid', message ? 'true' : 'false'));
  };
  return { el, setError };
}

function numberField(field, store, onChange) {
  const id = uid('num');
  const input = h('input', {
    id,
    type: 'text',
    inputmode: field.type === 'percent' ? 'decimal' : 'numeric',
    autocomplete: 'off',
    class: 'input input--number',
    value: store.get(field.id) ?? '',
    placeholder: field.type === 'percent' ? '0 – 100' : 'العدد',
    'aria-describedby': `${id}-err`,
  });
  const control = field.type === 'percent' ? h('div', { class: 'input-affix' }, input, h('span', { class: 'input-affix__suffix' }, '%')) : input;
  const shell = fieldShell(field, id, control);
  input.addEventListener('input', () => {
    const clean = normalizeDigits(input.value).replace(/\s+/g, '');
    if (clean !== input.value) input.value = clean;
    store.set(field.id, clean);
    if (shell.el.classList.contains('has-error')) shell.setError(numberError(field, clean));
    onChange();
  });
  input.addEventListener('blur', () => shell.setError(numberError(field, store.get(field.id))));
  return shell;
}

function textField(field, store, onChange) {
  const id = uid('txt');
  const input = h('input', { id, type: 'text', class: 'input', value: store.get(field.id) ?? '', placeholder: field.placeholder || '', maxlength: 300 });
  input.addEventListener('input', () => {
    store.set(field.id, input.value);
    onChange();
  });
  return fieldShell(field, id, input);
}

function selectField(field, store, onChange) {
  const id = uid('sel');
  const current = store.get(field.id) ?? '';
  const select = h(
    'select',
    { id, class: 'input input--select' },
    h('option', { value: '' }, 'اختاري…'),
    field.options.map((opt) => h('option', { value: opt, selected: opt === current }, opt)),
  );
  const shell = fieldShell(field, id, select);
  select.addEventListener('change', () => {
    store.set(field.id, select.value);
    shell.setError(selectError(field, select.value));
    onChange();
  });
  shell.setError(selectError(field, current));
  return shell;
}

function dateField(field, store, onChange) {
  const id = uid('date');
  const input = h('input', { id, type: 'date', class: 'input input--date', value: store.get(field.id) ?? '' });
  input.addEventListener('change', () => {
    store.set(field.id, input.value);
    onChange();
  });
  return fieldShell(field, id, input);
}

function textareaField(field, store, onChange) {
  const id = uid('area');
  const area = h('textarea', { id, class: 'input input--area', rows: 3, placeholder: 'اكتبي هنا…', 'aria-describedby': field.sensitive ? `${id}-privacy` : null });
  area.value = store.get(field.id) ?? '';
  area.addEventListener('input', () => {
    store.set(field.id, area.value);
    onChange();
  });
  return fieldShell(field, id, area, { wide: true });
}

function yesNoField(field, store, onChange) {
  const name = uid('yn');
  const noteKey = `${field.id}__note`;
  const current = store.get(field.id) ?? '';
  const group = h(
    'div',
    { class: 'segmented', role: 'radiogroup', 'aria-label': field.label },
    YES_NO_OPTIONS.map((opt) =>
      h(
        'label',
        { class: `segmented__option segmented__option--${opt.value}` },
        h('input', { type: 'radio', name, value: opt.value, checked: current === opt.value }),
        h('span', null, opt.label),
      ),
    ),
  );

  let noteWrap = null;
  if (field.note) {
    const noteId = uid('note');
    const area = h('textarea', { id: noteId, class: 'input input--area', rows: 2, placeholder: 'اكتبي الملاحظة أو الإجراء…' });
    area.value = store.get(noteKey) ?? '';
    area.addEventListener('input', () => {
      store.set(noteKey, area.value);
      onChange();
    });
    noteWrap = h('div', { class: 'field__note' }, h('label', { class: 'field__sublabel', for: noteId }, field.note.label), area);
  }

  const syncNote = () => {
    if (!noteWrap) return;
    noteWrap.hidden = store.get(field.id) !== field.note.when;
  };

  group.addEventListener('change', (e) => {
    store.set(field.id, e.target.value);
    syncNote();
    onChange();
  });

  const shell = fieldShell(field, name, h('div', { class: 'yesno' }, group, noteWrap), { wide: true });
  shell.el.querySelector('.field__label').removeAttribute('for');
  syncNote();
  return shell;
}

function tableCellInput(col, row, onCellChange) {
  const id = uid('cell');
  let input;
  if (col.type === 'day') {
    input = h('select', { id, class: 'input input--select' }, h('option', { value: '' }, '—'), WEEK_DAYS.map((d) => h('option', { value: d, selected: row[col.id] === d }, d)));
  } else if (col.type === 'date' || col.type === 'time') {
    input = h('input', { id, type: col.type, class: `input input--${col.type}`, value: row[col.id] ?? '' });
  } else {
    input = h('input', { id, type: 'text', class: 'input', value: row[col.id] ?? '', maxlength: 400 });
  }
  input.addEventListener(input.tagName === 'SELECT' || col.type !== 'text' ? 'change' : 'input', () => onCellChange(col, input.value));
  return { input, wrap: h('div', { class: `cell cell--${col.type}` }, h('label', { class: 'cell__label', for: id }, col.label), input) };
}

function tableField(field, store, onChange) {
  const list = h('div', { class: 'repeat__list' });
  const empty = h('p', { class: 'repeat__empty' }, 'لا توجد صفوف بعد. اضغطي «' + (field.addLabel || 'إضافة صف') + '» للإضافة.');
  const rows = () => store.get(field.id) || [];

  const renderRows = () => {
    list.replaceChildren();
    const data = rows();
    empty.hidden = data.length > 0;
    data.forEach((row, index) => {
      const inputs = {};
      const cells = field.columns.map((col) => {
        const { input, wrap } = tableCellInput(col, row, (c, value) => {
          row[c.id] = value;
          if (c.type === 'date' && inputs.day && (!row.day || row.__autoDay)) {
            const name = dayName(value);
            row.day = WEEK_DAYS.includes(name) ? name : '';
            row.__autoDay = true;
            inputs.day.value = row.day;
          }
          if (c.type === 'day') row.__autoDay = false;
          store.set(field.id, data);
          onChange();
        });
        inputs[col.id] = input;
        return wrap;
      });
      list.append(
        h(
          'div',
          { class: 'repeat__row' },
          h('span', { class: 'repeat__num' }, String(index + 1)),
          h('div', { class: 'repeat__cells' }, cells),
          h(
            'button',
            {
              type: 'button',
              class: 'icon-btn icon-btn--danger',
              title: 'حذف الصف',
              'aria-label': `حذف الصف ${index + 1}`,
              onclick: () => {
                data.splice(index, 1);
                store.set(field.id, data);
                renderRows();
                onChange();
              },
            },
            icon('trash'),
          ),
        ),
      );
    });
  };

  const addBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn--soft btn--sm',
      onclick: () => {
        const data = rows();
        data.push(Object.fromEntries(field.columns.map((c) => [c.id, ''])));
        store.set(field.id, data);
        renderRows();
        onChange();
        list.lastElementChild?.querySelector('input, select')?.focus();
      },
    },
    icon('plus'),
    field.addLabel || 'إضافة صف',
  );

  renderRows();
  const el = h(
    'div',
    { class: 'field field--table field--wide', dataset: { fieldId: field.id } },
    h('div', { class: 'repeat__head' }, h('span', { class: 'field__label' }, field.label), field.sensitive ? h('span', { class: 'tag' }, 'لا يُحفظ في المسودة') : null),
    list,
    empty,
    h('div', { class: 'repeat__actions' }, addBtn),
  );
  return { el, setError: () => {}, refresh: renderRows };
}

const RENDERERS = {
  number: numberField,
  percent: numberField,
  text: textField,
  select: selectField,
  date: dateField,
  textarea: textareaField,
  yesno: yesNoField,
  table: tableField,
};

export function renderField(field, store, onChange) {
  const renderer = RENDERERS[field.type];
  if (!renderer) throw new Error(`نوع بند غير معروف: ${field.type}`);
  return renderer(field, store, onChange);
}
