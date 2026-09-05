import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export const aiTools = {
  findDoctors: params => navigate('Doctors', params),
  findClinics: params => navigate('Clinics', params),
  findHospitals: params => navigate('Hospitals', {filter: 'Hospitals', ...params}),
  findNursingHomes: params => navigate('Hospitals', {filter: 'Nursing Homes', ...params}),
  findPharmacies: params => navigate('ProviderList', {type: 'PHARMACY', titleKey: 'pharmacies', ...params}),
  findLabs: params => navigate('ProviderList', {type: 'LABORATORY', titleKey: 'labs', ...params}),
  findDiagnosticCenters: params =>
    navigate('ProviderList', {type: 'DIAGNOSTIC_CENTRE', titleKey: 'diagnostics', ...params}),
  searchMedicine: params => navigate('Medicines', params),
  findNearbyServices: params => navigate('Search', params),
  openPrescriptions: () => navigate('Prescriptions'),
  openHealthRecords: () => navigate('HealthRecords'),
  openReports: () => navigate('Reports'),
  trackOrder: () => navigate('Orders'),
  openEmergency: () => navigate('Emergency'),
  openProfile: () => navigate('Profile'),
  openMessages: () => navigate('Messages'),
};

export function runTool(name, params) {
  const fn = aiTools[name];
  if (fn) {
    fn(params);
    return true;
  }
  return false;
}

export function runScreenAction(screen, params) {
  const map = {
    Doctors: 'findDoctors',
    Clinics: 'findClinics',
    Hospitals: 'findHospitals',
    NursingHomes: 'findNursingHomes',
    Pharmacies: 'findPharmacies',
    Labs: 'findLabs',
    Diagnostics: 'findDiagnosticCenters',
    Medicines: 'searchMedicine',
    Nearby: 'findNearbyServices',
    Search: 'findNearbyServices',
    Prescriptions: 'openPrescriptions',
    HealthRecords: 'openHealthRecords',
    Reports: 'openReports',
    Orders: 'trackOrder',
    Emergency: 'openEmergency',
    Profile: 'openProfile',
    Messages: 'openMessages',
  };
  return runTool(map[screen] || screen, params);
}
