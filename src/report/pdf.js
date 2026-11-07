import { reportFileName } from '../utils/format.js';
import { buildReportPages } from './render.js';

const A4 = { w: 210, h: 297 };

/**
 * يرسم كل صفحة HTML كصورة عالية الدقة بمحرك المتصفح نفسه (فيبقى تشكيل الحروف العربية واتجاهها سليمًا)
 * ثم يضعها في ملف PDF بمقاس A4.
 */
export async function createPdf(form, state, onProgress = () => {}) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')]);
  const { pages, dispose } = await buildReportPages(form, state);
  const scale = Math.min(2.5, Math.max(2, window.devicePixelRatio || 1));
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    for (let i = 0; i < pages.length; i += 1) {
      onProgress(i + 1, pages.length);
      const canvas = await html2canvas(pages[i], {
        scale,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pages[i].offsetWidth,
        windowHeight: pages[i].offsetHeight,
      });
      if (i > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4.w, A4.h, undefined, 'FAST');
      canvas.width = canvas.height = 0;
    }
    const fileName = reportFileName(form, state.base.weekNumber);
    return { blob: pdf.output('blob'), fileName, pageCount: pages.length };
  } finally {
    dispose();
  }
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function canShareFile(blob, fileName) {
  try {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    return Boolean(navigator.canShare?.({ files: [file] })) ? file : null;
  } catch {
    return null;
  }
}
