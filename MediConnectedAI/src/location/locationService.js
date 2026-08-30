import Geolocation from '@react-native-community/geolocation';
import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {userApi} from '../api/userApi';
import {saveLocation} from '../auth/authService';

const locPerm = Platform.select({
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
});

export async function ensureLocationPermission() {
  const status = await check(locPerm);
  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return true;
  }
  const next = await request(locPerm);
  return next === RESULTS.GRANTED || next === RESULTS.LIMITED;
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      err => reject(err),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 60000},
    );
  });
}

export async function captureAndMapLocation() {
  const allowed = await ensureLocationPermission();
  if (!allowed) {
    return {denied: true};
  }
  const coords = await getCurrentPosition();
  const mapped = await userApi.reverseGeocode(coords);
  const profile = await saveLocation({
    lat: mapped.lat,
    lng: mapped.lng,
    city: mapped.city,
    district: mapped.district,
    state: mapped.state,
    pin: mapped.pin,
    country: mapped.country || 'India',
    address: mapped.address,
    locationSource: 'GPS',
  });
  return {denied: false, profile, mapped};
}

export function formatLocationLabel(patient) {
  if (!patient) {
    return '';
  }
  return [patient.city, patient.district, patient.state].filter(Boolean).join(', ');
}
