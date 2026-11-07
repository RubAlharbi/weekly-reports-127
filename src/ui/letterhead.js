import { SCHOOL } from '../config/school.js';
import { h } from '../utils/dom.js';

const logoStatus = { school: null, moe: null };

function probe(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export async function preloadLogos() {
  const [school, moe] = await Promise.all([probe(SCHOOL.logos.school), probe(SCHOOL.logos.moe)]);
  logoStatus.school = school;
  logoStatus.moe = moe;
  return { ...logoStatus };
}

export function logosStatus() {
  return { ...logoStatus };
}

const LOGO_ALT = { school: 'شعار المدرسة', moe: 'شعار وزارة التعليم' };

/** شعار بحجم ثابت مع الحفاظ على تناسب الأبعاد، أو إطار فارغ إن لم يتوفر الملف. */
export function logo(kind, className) {
  const box = h('div', { class: `${className} ${className}--${kind}` });
  if (logoStatus[kind] === false) {
    box.classList.add('is-missing');
    box.append(h('span', null, LOGO_ALT[kind]));
  } else {
    box.append(h('img', { src: SCHOOL.logos[kind], alt: LOGO_ALT[kind], decoding: 'sync' }));
  }
  return box;
}

export function siteLetterhead() {
  return h(
    'header',
    { class: 'letterhead' },
    h(
      'div',
      { class: 'letterhead__inner' },
      logo('school', 'letterhead__logo'),
      h('div', { class: 'letterhead__org' }, SCHOOL.headerLines.map((line, i) => h('p', { class: i === SCHOOL.headerLines.length - 1 ? 'is-school' : '' }, line))),
      logo('moe', 'letterhead__logo'),
    ),
    h('div', { class: 'letterhead__title' }, h('span', null, SCHOOL.reportTitle)),
  );
}
