import {http, unwrap} from './client';

export const providerApi = {
  list: params => unwrap(http.get('/providers', {params})),
  one: (id, params) => unwrap(http.get(`/providers/${id}`, {params})),
  doctors: params => unwrap(http.get('/doctors', {params})),
  search: params => unwrap(http.get('/search', {params})),
  appointments: () => unwrap(http.get('/appointments')),
  bookConsult: body => unwrap(http.post('/appointments', body)),
};
