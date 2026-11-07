import { SCHOOL } from '../config/school.js';
import { h } from '../utils/dom.js';
import { escapeHtml, isBlank } from '../utils/format.js';
import { logo } from '../ui/letterhead.js';

function createPage(form, state, isFirst) {
  const week = state.base.weekNumber;
  const flow = h('div', { class: 'rp-flow' });
  const body = h('main', { class: 'rp-body' }, flow);
  const pageNo = h('span', { class: 'rp-footer__page' });
  const el = h(
    'section',
    { class: `rp-page${isFirst ? ' rp-page--first' : ''}` },
    h(
      'header',
      { class: 'rp-header' },
      logo('school', 'rp-logo'),
      h('div', { class: 'rp-org' }, SCHOOL.headerLines.map((line, i) => h('p', { class: i === SCHOOL.headerLines.length - 1 ? 'is-school' : '' }, line))),
      logo('moe', 'rp-logo'),
    ),
    isFirst
      ? h('div', { class: 'rp-titlebar' }, h('h1', null, SCHOOL.reportTitle), h('h2', null, form.title))
      : h('div', { class: 'rp-titlebar rp-titlebar--cont' }, h('h2', null, `${SCHOOL.reportTitle} – ${form.title}`), h('span', null, 'تابع')),
    body,
    h(
      'footer',
      { class: 'rp-footer' },
      h('span', null, `${SCHOOL.schoolName} • ${form.title}${isBlank(week) ? '' : ` • الأسبوع ${week}`}`),
      pageNo,
    ),
  );
  return { el, body, flow, pageNo };
}

function colgroup(cols) {
  return h('colgroup', null, cols.map((c) => h('col', { style: { width: `${c.width}%` } })));
}

function createTable(unit) {
  const tbody = h('tbody');
  const table = h(
    'table',
    { class: `rp-table rp-table--${unit.variant}` },
    colgroup(unit.cols),
    h('thead', null, h('tr', null, unit.cols.map((c) => h('th', null, c.label)))),
    tbody,
  );
  return { table, tbody };
}

function renderRow(row) {
  const tr = h('tr');
  row.cells.forEach((html, i) => {
    const td = h('td', { colspan: row.span && i === 1 ? '2' : null, class: row.span && i === 1 ? 'rp-span' : null });
    if (row.text && row.text.cell === i) {
      td.innerHTML = `${row.text.before}<span class="rp-longtext">${escapeHtml(row.text.value)}</span>${row.text.after}`;
    } else {
      td.innerHTML = html;
    }
    tr.append(td);
  });
  return tr;
}

function withText(row, value, continued) {
  const orig = row.orig || row.cells;
  const cells = continued ? orig.map((c, i) => (i === 0 ? '' : i === 1 ? `${c} <small class="rp-cont">(تابع)</small>` : c)) : row.cells;
  const before = continued ? row.text.contBefore ?? '' : row.text.before;
  const after = continued ? '' : row.text.after;
  return { orig, span: row.span, cells, text: { ...row.text, value, before, after } };
}

function renderInfo(unit) {
  const rows = [];
  for (let i = 0; i < unit.pairs.length; i += 2) {
    const [a, b] = [unit.pairs[i], unit.pairs[i + 1]];
    rows.push(
      h(
        'tr',
        null,
        h('th', null, a[0]),
        h('td', { html: a[1], colspan: b ? null : '3' }),
        b ? h('th', null, b[0]) : null,
        b ? h('td', { html: b[1] }) : null,
      ),
    );
  }
  return h('table', { class: 'rp-info' }, colgroup([{ width: 20 }, { width: 30 }, { width: 20 }, { width: 30 }]), h('tbody', null, rows));
}

function renderSignature(state) {
  const agent = isBlank(state.base.agentName) ? '' : escapeHtml(state.base.agentName);
  return h(
    'div',
    { class: 'rp-signature', html: `
      <div class="rp-sign">
        <p class="rp-sign__role">الوكيلة</p>
        <p class="rp-sign__name">${agent || '&nbsp;'}</p>
        <p class="rp-sign__line"><span>التوقيع:</span><i></i></p>
      </div>
      <div class="rp-sign">
        <p class="rp-sign__role">${escapeHtml(SCHOOL.principalTitle)}</p>
        <p class="rp-sign__name">${escapeHtml(SCHOOL.principalName)}</p>
        <p class="rp-sign__line"><span>التوقيع:</span><i></i></p>
      </div>` },
  );
}

/**
 * يوزع الكتل على صفحات A4 داخل host (يجب أن يكون في المستند حتى تُقاس الأحجام).
 * - العناوين تبقى مع أول صف بعدها.
 * - الصف لا ينقسم بين صفحتين؛ النص الطويل جدًا فقط يُجزأ على صفوف «تابع».
 * - رأس الجدول وعنوان القسم يتكرران في الصفحة التالية.
 */
export function paginate(form, state, units, host) {
  const pages = [];
  let page;
  let pending = [];

  const newPage = () => {
    page = createPage(form, state, pages.length === 0);
    host.append(page.el);
    pages.push(page);
  };
  // هامش أمان صغير حتى لا يُقص السطر الأخير عند الطباعة بفروق التقريب بين المتصفحات.
  const overflows = () => page.flow.offsetHeight > page.body.clientHeight - 4;
  const moveToNewPage = (els) => {
    els.forEach((e) => e.remove());
    newPage();
    page.flow.append(...els);
  };

  newPage();

  for (const unit of units) {
    if (unit.kind === 'heading' || unit.kind === 'subheading') {
      const el = h('h3', { class: `rp-${unit.kind}` }, unit.text);
      page.flow.append(el);
      pending.push(el);
      continue;
    }

    if (unit.kind === 'info' || unit.kind === 'signature') {
      const el = unit.kind === 'info' ? renderInfo(unit) : renderSignature(state);
      page.flow.append(el);
      if (overflows() && page.flow.children.length > pending.length + 1) moveToNewPage([...pending, el]);
      pending = [];
      continue;
    }

    let { table, tbody } = createTable(unit);
    page.flow.append(table);
    let placed = 0;
    let lead = [...pending];
    const queue = [...unit.rows];

    while (queue.length) {
      const row = queue.shift();
      const tr = renderRow(row);
      tbody.append(tr);
      if (!overflows()) {
        placed += 1;
        pending = [];
        continue;
      }

      const tall = tr.offsetHeight > page.body.clientHeight * 0.3;
      tr.remove();

      // لا يُترك عنوان قسم مع صف واحد فقط في أسفل الصفحة.
      if (placed === 1 && lead.length && page.flow.children.length > lead.length + 1) {
        moveToNewPage([...lead, table]);
        lead = [];
        queue.unshift(row);
        continue;
      }
      const fresh = placed === 0 && page.flow.children.length === pending.length + 1;

      if (row.text && (fresh || tall)) {
        const parts = splitToFit(row, tbody, overflows);
        if (parts) {
          tbody.append(renderRow(parts[0]));
          placed += 1;
          pending = [];
          queue.unshift(parts[1]);
          continue;
        }
      }

      if (fresh) {
        tbody.append(tr);
        placed += 1;
        pending = [];
        continue;
      }

      if (placed === 0) {
        moveToNewPage([...pending, table]);
      } else {
        newPage();
        const cont = h('h3', { class: 'rp-heading rp-heading--cont' }, `${unit.continueLabel} (تابع)`);
        ({ table, tbody } = createTable(unit));
        page.flow.append(cont, table);
        pending = [cont];
        placed = 0;
      }
      lead = [];
      queue.unshift(row);
    }
  }

  pages.forEach((p, i) => {
    p.pageNo.textContent = `صفحة ${i + 1} من ${pages.length}`;
  });
  return pages.map((p) => p.el);
}

/** يجد أطول جزء من النص يتسع في الصفحة الحالية، ويعيد [الجزء الأول، الباقي] أو null. */
function splitToFit(row, tbody, overflows) {
  const tokens = row.text.value.split(/(\s+)/);
  let lo = 0;
  let hi = tokens.length - 1;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const tr = renderRow(withText(row, `${tokens.slice(0, mid).join('').trimEnd()} …`, false));
    tbody.append(tr);
    const fits = !overflows();
    tr.remove();
    if (fits) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  const head = tokens.slice(0, best).join('').trim();
  const tail = tokens.slice(best).join('').trim();
  if (!head || !tail) return null;
  return [withText(row, `${head} …`, false), withText(row, tail, true)];
}
