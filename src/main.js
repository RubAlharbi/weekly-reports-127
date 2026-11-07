import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/tajawal/800.css';
import './styles/base.css';
import './styles/app.css';
import './styles/report.css';

import { getForm } from './config/forms/index.js';
import { SCHOOL } from './config/school.js';
import { h } from './utils/dom.js';
import { renderFormView, hasUnsavedData } from './ui/formView.js';
import { renderHome } from './ui/home.js';
import { preloadLogos, siteLetterhead } from './ui/letterhead.js';

const app = document.getElementById('app');
let outlet;

function route() {
  const match = /^#\/form\/([\w-]+)/.exec(location.hash);
  const form = match ? getForm(match[1]) : null;
  if (match && !form) {
    location.replace('#/');
    return;
  }
  document.title = form ? `${form.title} – ${SCHOOL.schoolName}` : SCHOOL.siteTitle;
  outlet.replaceChildren(form ? renderFormView(form) : renderHome());
  window.scrollTo(0, 0);
}

async function start() {
  await preloadLogos();
  outlet = h('main', { class: 'outlet', id: 'main' });
  app.replaceChildren(
    siteLetterhead(),
    outlet,
    h('footer', { class: 'site-footer' }, h('p', null, SCHOOL.siteTitle), h('p', null, 'تعمل هذه الصفحة داخل المتصفح فقط ولا ترسل أي بيانات إلى خادم.')),
  );
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedData()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  route();
}

start();
