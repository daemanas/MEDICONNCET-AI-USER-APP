import {http, unwrap} from './client';

export const medicineApi = {
  search: params => unwrap(http.get('/medicines', {params})),
};
