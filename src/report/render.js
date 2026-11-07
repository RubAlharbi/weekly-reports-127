import { h } from '../utils/dom.js';
import { buildUnits } from './model.js';
import { paginate } from './layout.js';

async function fontsReady() {
  if (!document.fonts) return;
  const sample = 'التقرير الأسبوعي 0123';
  await Promise.all(['400', '500', '700', '800'].map((w) => document.fonts.load(`${w} 16px Tajawal`, sample).catch(() => null)));
  await document.fonts.ready;
}

async function imagesReady(root) {
  await Promise.all(
    [...root.querySelectorAll('img')].map((img) => (img.complete && img.naturalWidth ? img.decode?.().catch(() => null) : new Promise((r) => {
      img.onload = img.onerror = r;
    }))),
  );
}

/** يبني صفحات التقرير داخل منصة مخفية خلف الواجهة ويعيدها. */
export async function buildReportPages(form, state) {
  await fontsReady();
  const stage = h('div', { class: 'report-stage', 'aria-hidden': 'true' });
  document.body.append(stage);
  const pages = paginate(form, state, buildUnits(form, state), stage);
  await imagesReady(stage);
  return { pages, stage, dispose: () => stage.remove() };
}
