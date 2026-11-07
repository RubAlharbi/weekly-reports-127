export default {
  id: 'school',
  agency: 'الشؤون المدرسية',
  title: 'تقرير الشؤون المدرسية',
  description: 'المعاملات الإدارية، الصيانة والمرافق، النقل المدرسي، والمتابعة الإدارية والمالية.',
  icon: 'building',
  sections: [
    {
      id: 'transactions',
      title: 'المعاملات الإدارية',
      fields: [
        { id: 'incoming', type: 'number', label: 'عدد المعاملات الواردة' },
        { id: 'outgoing', type: 'number', label: 'عدد المعاملات الصادرة' },
        { id: 'pending', type: 'number', label: 'عدد المعاملات القائمة خلال الأسبوع' },
        { id: 'letters', type: 'number', label: 'عدد الخطابات الصادرة خلال الأسبوع' },
      ],
    },
    {
      id: 'maintenance',
      title: 'متابعة الصيانة والمرافق',
      fields: [
        { id: 'maintRequests', type: 'number', label: 'عدد طلبات الصيانة' },
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
        { id: 'roundsCount', type: 'number', label: 'عدد الجولات التفقدية' },
        {
          id: 'roundsDetails',
          type: 'table',
          label: 'وقت الجولات وتفاصيلها',
          addLabel: 'إضافة جولة',
          columns: [
            { id: 'day', label: 'اليوم', type: 'day', width: 14 },
            { id: 'date', label: 'التاريخ', type: 'date', width: 18 },
            { id: 'time', label: 'الوقت', type: 'time', width: 14 },
            { id: 'details', label: 'التفاصيل والملاحظات', type: 'text', width: 54 },
          ],
        },
        { id: 'maintNotes', type: 'textarea', label: 'ملاحظات الصيانة' },
      ],
    },
    {
      id: 'transport',
      title: 'متابعة النقل المدرسي',
      fields: [
        { id: 'transportStudents', type: 'number', label: 'عدد الطلاب المسجلين في النقل المدرسي' },
        { id: 'transportTrips', type: 'number', label: 'عدد الرحلات' },
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
      id: 'extra',
      title: 'بنود إضافية من الاستمارة الأصلية',
      fields: [
        // صياغة هذين البندين بانتظار المراجعة؛ عدّلي قيمة label فقط ليتغير المسمى في الاستمارة وملف PDF.
        { id: 'lineupLate', type: 'number', label: 'عدد حالات التأخر في الطابور' },
        { id: 'deductionPeriods', type: 'number', label: 'عدد فترات الحسم' },
      ],
    },
  ],
};
