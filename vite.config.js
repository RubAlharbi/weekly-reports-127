import { defineConfig } from 'vite';

// يمنع المتصفح من الاتصال بأي جهة خارجية: كل السكربتات والخطوط والصور من الموقع نفسه فقط،
// ولا يُسمح بإرسال بيانات أو نماذج لأي خادم. تُضاف في نسخة النشر فقط لأن خادم التطوير يحتاج اتصالًا مباشرًا.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob:",
  "frame-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy() {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace('<meta charset="UTF-8" />', `$&\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`),
  };
}

// base نسبي حتى يعمل الموقع من أي مسار فرعي على GitHub Pages (مثل /اسم-المستودع/).
export default defineConfig({
  base: './',
  plugins: [contentSecurityPolicy()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
});
