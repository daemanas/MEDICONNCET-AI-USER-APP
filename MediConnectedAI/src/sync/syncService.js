import NetInfo from '@react-native-community/netinfo';
import {Q} from '@nozbe/watermelondb';
import {syncApi} from '../api/syncApi';
import {database, getMeta, setMeta} from '../database/database';
import {isFacilityOpenNow} from '../utils/hours';

let started = false;
let lastError = null;

export function getLastSyncError() {
  return lastError;
}

export async function runSync({patient, forceFull} = {}) {
  const district = patient?.district;
  const city = patient?.city;
  if (!district && !city) {
    return {skipped: true, reason: 'NO_LOCATION'};
  }
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    return {skipped: true, reason: 'OFFLINE'};
  }
  const updatedSince = forceFull ? null : await getMeta('updatedSince');
  try {
    const payload = await syncApi.pull({
      district,
      city,
      updatedSince: updatedSince || undefined,
    });
    await applySyncPayload(payload, {incremental: !!updatedSince});
    await setMeta('updatedSince', payload.lastSyncAt);
    await setMeta('lastSyncAt', payload.lastSyncAt);
    await setMeta('syncDistrict', district || '');
    await setMeta('syncCity', city || '');
    lastError = null;
    return payload;
  } catch (err) {
    lastError = err.message;
    throw err;
  }
}

async function applySyncPayload(payload, {incremental}) {
  const providers = payload.providers || [];
  const doctors = payload.doctors || [];
  const medicines = payload.medicines || [];

  await database.write(async () => {
    if (!incremental) {
      const existingP = await database.get('providers').query().fetch();
      const existingD = await database.get('doctors').query().fetch();
      const existingM = await database.get('medicines').query().fetch();
      await Promise.all([
        ...existingP.map(r => r.destroyPermanently()),
        ...existingD.map(r => r.destroyPermanently()),
        ...existingM.map(r => r.destroyPermanently()),
      ]);
    }

    for (const p of providers) {
      await upsert('providers', p.id, rec => {
        rec.remoteId = p.id;
        rec.name = p.name || '';
        rec.type = p.type || '';
        rec.address = p.address || '';
        rec.city = p.city || '';
        rec.district = p.district || '';
        rec.state = p.state || '';
        rec.pin = p.pin || '';
        rec.lat = p.geo?.lat ?? null;
        rec.lng = p.geo?.lng ?? null;
        rec.contactNumber = p.contactNumber || '';
        rec.emergencyAvailable = !!p.emergencyAvailable;
        rec.deliveryAvailable = !!p.deliveryAvailable;
        rec.pickupAvailable = p.pickupAvailable !== false;
        rec.hoursJson = JSON.stringify(p.operatingHours || []);
        rec.description = p.description || '';
        rec.updatedAtRemote = p.updatedAt ? new Date(p.updatedAt).getTime() : Date.now();
      });
    }
    for (const d of doctors) {
      await upsert('doctors', d.id, rec => {
        rec.remoteId = d.id;
        rec.name = d.name || '';
        rec.specialization = d.specialization || '';
        rec.qualification = d.qualification || '';
        rec.experienceYears = d.experienceYears || 0;
        rec.availability = d.availability || 'OFFLINE';
        rec.facilityId = d.facilityId || '';
        rec.facilityName = d.facilityName || '';
        rec.city = d.city || '';
        rec.district = d.district || '';
      });
    }
    for (const m of medicines) {
      await upsert('medicines', m.id, rec => {
        rec.remoteId = m.id;
        rec.name = m.name || '';
        rec.genericName = m.genericName || '';
        rec.brandName = m.brandName || '';
        rec.strength = m.strength || '';
        rec.dosageForm = m.dosageForm || '';
        rec.facilityId = m.facilityId || '';
        rec.quantity = m.quantity || 0;
        rec.unitPrice = m.unitPrice || 0;
        rec.prescriptionRequired = !!m.prescriptionRequired;
      });
    }
  });
}

async function upsert(table, remoteId, writer) {
  const found = await database.get(table).query(Q.where('remote_id', remoteId)).fetch();
  if (found[0]) {
    await found[0].update(writer);
  } else {
    await database.get(table).create(writer);
  }
}

export async function searchOffline({q, type}) {
  const needle = String(q || '').trim().toLowerCase();
  let providers = await database.get('providers').query().fetch();
  if (type) {
    providers = providers.filter(p => p.type === type);
  }
  if (needle) {
    providers = providers.filter(p =>
      [p.name, p.city, p.district, p.type, p.address].some(v => String(v || '').toLowerCase().includes(needle)),
    );
  }
  const lastSyncAt = await getMeta('lastSyncAt');
  return {
    providers: providers.map(p => ({...p.toPublic(), ...isFacilityOpenNow(JSON.parse(p.hoursJson || '[]'))})),
    lastSyncAt,
    offline: true,
  };
}

export async function searchOfflineDoctors(q) {
  const needle = String(q || '').trim().toLowerCase();
  let rows = await database.get('doctors').query().fetch();
  if (needle) {
    rows = rows.filter(d =>
      [d.name, d.specialization, d.facilityName].some(v => String(v || '').toLowerCase().includes(needle)),
    );
  }
  return rows.map(d => d.toPublic());
}

export async function searchOfflineMedicines(q) {
  const needle = String(q || '').trim().toLowerCase();
  let rows = await database.get('medicines').query().fetch();
  if (needle) {
    rows = rows.filter(m =>
      [m.name, m.genericName, m.brandName].some(v => String(v || '').toLowerCase().includes(needle)),
    );
  }
  const lastSyncAt = await getMeta('lastSyncAt');
  return {medicines: rows.map(m => m.toPublic()), lastSyncAt, offline: true};
}

export function startSyncListener(getPatient) {
  if (started) {
    return;
  }
  started = true;
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      const patient = getPatient?.();
      if (patient) {
        runSync({patient}).catch(() => {});
      }
    }
  });
}
