import {t as common} from './en/common';
import {home} from './en/home';
import {services} from './en/services';
import {profile} from './en/profile';
import {ai} from './en/ai';
import {orders} from './en/orders';
import {reports} from './en/reports';

const dictionaries = {
  en: {common, home, services, profile, ai, orders, reports},
};

let active = 'en';

export function setLanguage(code) {
  if (dictionaries[code]) {
    active = code;
  }
}

export function getLanguage() {
  return active;
}

export function tx(section, key) {
  const dict = dictionaries[active] || dictionaries.en;
  const value = dict[section]?.[key];
  if (value != null) {
    return value;
  }
  return dictionaries.en[section]?.[key] || key;
}

export const i18n = {
  t: key => tx('common', key),
  home: key => tx('home', key),
  services: key => tx('services', key),
  profile: key => tx('profile', key),
  ai: key => tx('ai', key),
  orders: key => tx('orders', key),
  reports: key => tx('reports', key),
};
