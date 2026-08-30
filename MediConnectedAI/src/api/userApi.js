import {http, unwrap} from './client';

export const userApi = {
  me: () => unwrap(http.get('/me')),
  patchMe: body => unwrap(http.patch('/me', body)),
  patchLocation: body => unwrap(http.patch('/me/location', body)),
  reverseGeocode: ({lat, lng}) => unwrap(http.post('/geocode/reverse', {lat, lng})),
  notifications: () => unwrap(http.get('/notifications')),
  markNotificationsRead: () => unwrap(http.post('/notifications/read')),
  tips: () => unwrap(http.get('/tips')),
};
