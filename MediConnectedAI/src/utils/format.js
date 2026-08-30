export function isFacilityOpenNow(operatingHours, now = new Date()) {
  if (!Array.isArray(operatingHours) || !operatingHours.length) {
    return {open: null, closesAt: null};
  }
  const day = now.getDay();
  const row = operatingHours.find(h => Number(h.day) === day);
  if (!row) {
    return {open: null, closesAt: null};
  }
  if (row.closed) {
    return {open: false, closesAt: null};
  }
  if (!row.open || !row.close) {
    return {open: true, closesAt: row.close || null};
  }
  const [oh, om] = String(row.open).split(':').map(Number);
  const [ch, cm] = String(row.close).split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = oh * 60 + (om || 0);
  const end = ch * 60 + (cm || 0);
  const open = end > start ? mins >= start && mins <= end : mins >= start || mins <= end;
  return {open, closesAt: row.close};
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) {
    return null;
  }
  const n = Number(km);
  if (n < 1) {
    return `${Math.round(n * 1000)} m`;
  }
  return `${n.toFixed(1)} km`;
}

export function formatDate(value) {
  if (!value) {
    return '';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleString();
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function displayName(profile) {
  return profile?.patient?.name || profile?.user?.name || '';
}
