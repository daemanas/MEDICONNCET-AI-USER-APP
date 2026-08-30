import {http, unwrap} from './client';

export const orderApi = {
  list: () => unwrap(http.get('/orders')),
  one: id => unwrap(http.get(`/orders/${id}`)),
  create: body => unwrap(http.post('/orders', body)),
  cancel: id => unwrap(http.post(`/orders/${id}/cancel`)),
};
