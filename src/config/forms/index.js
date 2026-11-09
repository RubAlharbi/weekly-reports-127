/*
 * تعريف الاستمارات. كل استمارة مقسمة إلى أقسام، وكل قسم يحتوي بنودًا (fields).
 *
 * أنواع البنود المدعومة:
 *   number    عدد صحيح يقبل الصفر والأعداد الموجبة
 *   percent   نسبة مئوية من 0 إلى 100 (تقبل الكسور العشرية)
 *   yesno     نعم / لا / لا ينطبق
 *             note: { when: 'no' | 'yes', label } يُظهر مربع ملاحظات عند اختيار تلك الإجابة
 *   text      حقل نصي قصير
 *   textarea  مربع كتابة متعدد الأسطر
 *   date      منتقي تاريخ
 *   table     جدول بصفوف قابلة للإضافة والحذف؛ columns: [{ id, label, type: text|date|day|time, width }]
 *
 * sensitive: true  يمنع حفظ البند في المسودة المحلية (أسماء وحالات)، ويُظهر بجواره تنبيهًا بأنه يظهر في PDF ولا يُستعاد من المسودة.
 * تغيير label يغيّر المسمى في الاستمارة وفي ملف PDF معًا. لا تغيّري id بعد الاستخدام حتى لا تضيع المسودات.
 */
import schoolAffairs from './schoolAffairs.js';
import educationalAffairs from './educationalAffairs.js';
import studentAffairs from './studentAffairs.js';

export const FORMS = [schoolAffairs, educationalAffairs, studentAffairs];

export function getForm(id) {
  return FORMS.find((f) => f.id === id) || null;
}
