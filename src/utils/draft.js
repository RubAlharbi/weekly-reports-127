// المسودة تُحفظ على هذا الجهاز فقط (localStorage) وبطلب صريح من المستخدمة.
const PREFIX = 'weekly-report-draft:';

function sensitiveIds(form) {
  const ids = new Set();
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.sensitive) ids.add(field.id);
    }
  }
  return ids;
}

export function saveDraft(form, data) {
  const skip = sensitiveIds(form);
  const fields = {};
  for (const [key, value] of Object.entries(data.fields)) {
    const baseId = key.split('__')[0];
    if (!skip.has(baseId)) fields[key] = value;
  }
  const payload = { savedAt: new Date().toISOString(), base: data.base, fields };
  localStorage.setItem(PREFIX + form.id, JSON.stringify(payload));
  return { skipped: skip.size };
}

export function loadDraft(form) {
  try {
    const raw = localStorage.getItem(PREFIX + form.id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteDraft(form) {
  try {
    localStorage.removeItem(PREFIX + form.id);
  } catch {
    /* التخزين المحلي غير متاح */
  }
}

export function storageAvailable() {
  try {
    const k = `${PREFIX}test`;
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
