import { FORMS } from '../config/forms/index.js';
import { h } from '../utils/dom.js';
import { icon } from './icons.js';

export function renderHome() {
  const cards = FORMS.map((form, i) =>
    h(
      'article',
      { class: 'report-card', style: { '--delay': `${i * 70}ms` } },
      h('div', { class: 'report-card__icon' }, icon(form.icon)),
      h('h3', { class: 'report-card__title' }, form.title),
      h('p', { class: 'report-card__desc' }, form.description),
      h('p', { class: 'report-card__meta' }, `${form.sections.length} أقسام • ${form.sections.reduce((n, s) => n + s.fields.length, 0)} بندًا`),
      h('a', { class: 'btn btn--primary btn--block', href: `#/form/${form.id}` }, 'تعبئة التقرير'),
    ),
  );

  return h(
    'div',
    { class: 'view view--home' },
    h('section', { class: 'intro' }, h('h2', null, 'اختاري التقرير المطلوب تعبئته'), h('p', null, 'عبّئي الاستمارة، ثم عايني التقرير ونزّليه بصيغة PDF جاهزًا للطباعة على ورق A4.')),
    h('section', { class: 'cards' }, cards),
    h(
      'section',
      { class: 'notes' },
      h('div', { class: 'note' }, icon('shield'), h('div', null, h('strong', null, 'خصوصية البيانات'), h('p', null, 'تتم التعبئة داخل متصفحك فقط، ولا تُرسل أي بيانات أو إجابات إلى أي خادم أو جهة.'))),
      h('div', { class: 'note note--warn' }, icon('info'), h('div', null, h('strong', null, 'إرسال التقرير يدويًا'), h('p', null, 'تنزيل ملف PDF لا يعني إرسال التقرير إلى المديرة. بعد التنزيل أرسلي الملف عبر واتساب أو البريد الإلكتروني.'))),
    ),
  );
}
