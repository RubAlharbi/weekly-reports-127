const ALL_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const EMPTY = '—';

export function normalizeDigits(value) {
  return String(value ?? '')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u066B\u060C,]/g, '.');
}

export function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISO(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

let hijriFormatter;
function hijri(date) {
  try {
    hijriFormatter ??= new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return hijriFormatter.format(date);
  } catch {
    return '';
  }
}

export function dayName(iso) {
  const d = parseISO(iso);
  return d ? ALL_DAYS[d.getDay()] : '';
}

/** يعيد أجزاء التاريخ منفصلة ليتم عرضها دون انعكاس ترتيب الأرقام. */
export function formatDate(iso) {
  const d = parseISO(iso);
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return {
    weekday: ALL_DAYS[d.getDay()],
    greg: `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
    hijri: hijri(d),
  };
}

export function formatTime(value) {
  const m = /^(\d{1,2}):(\d{2})/.exec(value || '');
  if (!m) return value || '';
  let h = Number(m[1]);
  const suffix = h < 12 ? 'ص' : 'م';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${suffix}`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** اسم الملف للعرض داخل نص عربي دون أن ينقلب موضع «.pdf» والرقم. */
export function fileNameHtml(fileName) {
  const m = /^(.*?)([\w]*\.pdf)$/i.exec(fileName);
  return m ? `${escapeHtml(m[1])}<bdi dir="ltr">${m[2]}</bdi>` : escapeHtml(fileName);
}

export function reportFileName(form, weekNumber) {
  const agency = form.agency.trim().replace(/\s+/g, '-');
  const week = isBlank(weekNumber) ? 'بدون-رقم' : String(weekNumber).trim();
  return `تقرير-${agency}-الأسبوع-${week}.pdf`;
}
