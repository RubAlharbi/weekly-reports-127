// بيانات الترويسة والتذييل الرسمية – عدّليها من هنا عند الحاجة.
const base = import.meta.env.BASE_URL;

export const SCHOOL = {
  siteTitle: 'التقارير الأسبوعية – الابتدائية السابعة والعشرون بعد المائة',
  headerLines: [
    'المملكة العربية السعودية',
    'إدارة تعليم منطقة المدينة المنورة',
    'مكتب تعليم قباء',
    'الابتدائية السابعة والعشرون بعد المائة',
  ],
  schoolName: 'الابتدائية السابعة والعشرون بعد المائة',
  reportTitle: 'التقرير الأسبوعي',
  principalTitle: 'مديرة المدرسة',
  principalName: 'ليلى الحربي',
  logos: {
    school: `${base}assets/school-logo.png`,
    moe: `${base}assets/moe-logo.png`,
  },
};

export const SEMESTERS = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني'];

export const WEEK_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
