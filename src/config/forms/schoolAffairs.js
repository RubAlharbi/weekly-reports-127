// معرّفات بنود محذوفة قد تبقى قيمها في مسودات قديمة؛ لا يُعاد استخدامها لبنود جديدة:
// pending، roundsCount، roundsDetails، transportTrips (حلّ محله transportBuses)،
// maintRequests (حلّ محله maintRequestsUnified).
export default {
  id: 'school',
  agency: 'الشؤون المدرسية',
  title: 'تقرير الشؤون المدرسية',
  description: 'المعاملات الإدارية والدوام، الصيانة والمرافق والسلامة، النقل المدرسي، المتابعة الإدارية والمالية، والعهد والرجيع.',
  icon: 'building',
  sections: [
    {
      id: 'transactions',
      title: 'المعاملات الإدارية والدوام',
      fields: [
        { id: 'incoming', type: 'number', label: 'عدد المعاملات الواردة' },
        { id: 'outgoing', type: 'number', label: 'عدد المعاملات الصادرة' },
        { id: 'letters', type: 'number', label: 'عدد الخطابات الصادرة خلال الأسبوع' },
        { id: 'hodouriFollowUp', type: 'yesno', label: 'هل تمت متابعة غياب الموظفات عبر نظام حضوري؟' },
        { id: 'staffAbsent', type: 'number', label: 'عدد الموظفات الغائبات' },
        { id: 'staffLate', type: 'number', label: 'عدد الموظفات المتأخرات' },
        { id: 'absenceQueries', type: 'number', label: 'عدد مساءلات الغياب' },
        { id: 'lateQueries', type: 'number', label: 'عدد مساءلات التأخر' },
        { id: 'deductionDecisions', type: 'number', label: 'عدد قرارات الحسم' },
      ],
    },
    {
      id: 'maintenance',
      title: 'متابعة الصيانة والمرافق والسلامة',
      fields: [
        { id: 'maintRequestsUnified', type: 'number', label: 'عدد طلبات الصيانة المرفوعة عبر الدعم الموحد' },
        { id: 'maintDone', type: 'number', label: 'عدد الطلبات المنفذة' },
        { id: 'maintNotDone', type: 'number', label: 'عدد الطلبات غير المنفذة' },
        {
          id: 'safetyInspected',
          type: 'yesno',
          label: 'هل تم تفقد سلامة المبنى من قبل مختص؟',
          note: { when: 'no', label: 'سبب عدم التفقد والإجراء المتخذ' },
        },
        {
          id: 'recurringMaint',
          type: 'yesno',
          label: 'هل تم رصد حالات صيانة متكررة؟',
          note: { when: 'yes', label: 'وصف الحالات المتكررة' },
        },
        {
          id: 'roundsDone',
          type: 'yesno',
          label: 'هل تم تنفيذ جولات تفقدية؟',
          note: { when: 'no', label: 'سبب عدم تنفيذ الجولات' },
        },
        { id: 'emergencies', type: 'yesno', label: 'هل تم رصد حالات طارئة؟' },
        { id: 'emergencyDetails', type: 'textarea', label: 'تفاصيل الحالات الطارئة والإجراءات المتخذة' },
        { id: 'maintNotes', type: 'textarea', label: 'ملاحظات الصيانة' },
      ],
    },
    {
      id: 'transport',
      title: 'متابعة النقل المدرسي',
      fields: [
        { id: 'transportStudents', type: 'number', label: 'عدد الطلاب المسجلين في النقل المدرسي' },
        { id: 'transportBuses', type: 'number', label: 'عدد الحافلات' },
        { id: 'transportHasNotes', type: 'yesno', label: 'هل توجد ملاحظات على النقل المدرسي؟' },
        { id: 'transportNotes', type: 'textarea', label: 'تفاصيل الملاحظات' },
      ],
    },
    {
      id: 'finance',
      title: 'المتابعة الإدارية والمالية',
      fields: [
        {
          id: 'expensesFollowed',
          type: 'yesno',
          label: 'هل تمت متابعة مصروفات المدرسة واحتياجاتها؟',
          note: { when: 'no', label: 'السبب والإجراء المقترح' },
        },
        {
          id: 'spendingClosed',
          type: 'yesno',
          label: 'هل تم إغلاق الصرف في النظام؟',
          note: { when: 'no', label: 'سبب عدم الإغلاق والموعد المتوقع' },
        },
        { id: 'financeDetails', type: 'textarea', label: 'تفاصيل المتابعة والإجراءات' },
      ],
    },
    {
      id: 'custody',
      title: 'العهد والرجيع',
      fields: [
        { id: 'newCustodyType', type: 'text', label: 'نوع العهد الجديدة' },
        { id: 'newCustodyCount', type: 'number', label: 'عدد العهد الجديدة' },
        { id: 'returnsProcessed', type: 'yesno', label: 'هل تمت معالجة الرجيع؟' },
        { id: 'returnsDetails', type: 'textarea', label: 'تفاصيل معالجة الرجيع' },
      ],
    },
    {
      id: 'extra',
      title: 'بنود إضافية',
      fields: [
        // صياغة هذين البندين بانتظار المراجعة؛ عدّلي قيمة label فقط ليتغير المسمى في الاستمارة وملف PDF.
        { id: 'lineupLate', type: 'number', label: 'عدد حالات التأخر في الطابور' },
        { id: 'deductionPeriods', type: 'number', label: 'عدد فترات الحسم' },
      ],
    },
  ],
};
