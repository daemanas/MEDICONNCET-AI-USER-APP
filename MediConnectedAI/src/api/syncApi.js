import {http, unwrap} from './client';

export const aiApi = {
  chat: ({message, history}) => unwrap(http.post('/ai', {message, history})),
};

export const syncApi = {
  pull: params => unwrap(http.get('/sync', {params})),
};
