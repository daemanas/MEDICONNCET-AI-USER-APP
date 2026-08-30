import {http, unwrap} from './client';

export const reportApi = {
  list: category => unwrap(http.get('/reports', {params: {category}})),
  one: (id, kind) => unwrap(http.get(`/reports/${id}`, {params: {kind}})),
  prescriptions: () => unwrap(http.get('/prescriptions')),
  prescription: id => unwrap(http.get(`/prescriptions/${id}`)),
  records: () => unwrap(http.get('/records')),
};
