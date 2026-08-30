import {http, unwrap} from './client';

export const messageApi = {
  conversations: () => unwrap(http.get('/conversations')),
  open: facilityId => unwrap(http.post('/conversations', {facilityId})),
  messages: id => unwrap(http.get(`/conversations/${id}/messages`)),
  send: (id, body) => unwrap(http.post(`/conversations/${id}/messages`, {body})),
};
