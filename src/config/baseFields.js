import { SEMESTERS } from './school.js';

// البيانات الأساسية التي تظهر في بداية كل استمارة وفي رأس ملف PDF.
export const BASE_FIELDS = [
  { id: 'agentName', type: 'text', label: 'اسم الوكيلة', required: true, placeholder: 'الاسم الثلاثي' },
  { id: 'academicYear', type: 'text', label: 'العام الدراسي', required: true, placeholder: 'مثال: 1448هـ' },
  { id: 'semester', type: 'select', label: 'الفصل الدراسي', required: true, options: SEMESTERS },
  { id: 'weekNumber', type: 'number', label: 'رقم الأسبوع الدراسي', required: true, min: 1, max: 30 },
  { id: 'weekStart', type: 'date', label: 'تاريخ بداية الأسبوع', required: true },
  { id: 'weekEnd', type: 'date', label: 'تاريخ نهاية الأسبوع', required: true },
  { id: 'reportDate', type: 'date', label: 'تاريخ إعداد التقرير', required: true, defaultToday: true },
];
