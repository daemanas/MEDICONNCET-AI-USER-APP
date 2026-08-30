import {http, unwrap} from './client';

export const authApi = {
  requestOtp: phone => unwrap(http.post('/auth/otp/request', {phone})),
  verifyOtp: ({phone, code, name}) => unwrap(http.post('/auth/otp/verify', {phone, code, name})),
  logout: () => unwrap(http.post('/auth/logout')),
};
