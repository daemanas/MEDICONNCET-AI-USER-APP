import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {Doctor, Medicine, Provider, SyncMeta} from './models';
import {Q} from '@nozbe/watermelondb';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'mediconnected_area',
  jsi: true,
  onSetUpError: error => {
    console.warn('[watermelon] setup', error?.message);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Provider, Doctor, Medicine, SyncMeta],
});

export async function getMeta(key) {
  const rows = await database.get('sync_meta').query(Q.where('key', key)).fetch();
  return rows[0]?.value ?? null;
}

export async function setMeta(key, value) {
  await database.write(async () => {
    const rows = await database.get('sync_meta').query(Q.where('key', key)).fetch();
    if (rows[0]) {
      await rows[0].update(r => {
        r.value = String(value);
      });
    } else {
      await database.get('sync_meta').create(r => {
        r.key = key;
        r.value = String(value);
      });
    }
  });
}

export async function clearLocalUserData() {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}
