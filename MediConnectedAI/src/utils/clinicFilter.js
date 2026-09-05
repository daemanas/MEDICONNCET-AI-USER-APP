export function matchClinicCategory(cat, info) {
  if (cat === 'General Clinic') return /general|family|internal|medicine/i.test(info);
  if (cat === 'Dental') return /dental|dentistry|teeth|tooth|orthodont/i.test(info);
  if (cat === 'Eye Care') return /eye|vision|ophthalm|optometr/i.test(info);
  if (cat === 'Skin & Hair') return /skin|hair|dermatol|cosmetol|allergy/i.test(info);
  if (cat === 'Child Care') return /child|pediatr|newborn|infant|kid/i.test(info);
  return true;
}

export function filterClinics(rows, cat, q) {
  return (rows || []).filter(i => {
    if (i.type !== 'CLINIC') return false;
    const info = [i.subType, i.specialty, ...(i.specialties || []), ...(i.services || []), ...(i.facilities || []), i.name].join(' ');
    if (cat !== 'All' && !matchClinicCategory(cat, info)) return false;
    if (q.trim()) {
      const haystack = [i.name, i.address, i.city, i.district, info].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });
}
