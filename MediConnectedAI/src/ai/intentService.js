export function detectLocalIntent(text) {
  const t = String(text || '').toLowerCase();
  const pairs = [
    {re: /nursing home/, tool: 'findNursingHomes', screen: 'NursingHomes'},
    {re: /diagnostic|scan|x-?ray|ultrasound/, tool: 'findDiagnosticCenters', screen: 'Diagnostics'},
    {re: /lab|blood test|patholog/, tool: 'findLabs', screen: 'Labs'},
    {re: /pharmacy|medicine shop|chemist/, tool: 'findPharmacies', screen: 'Pharmacies'},
    {re: /hospital/, tool: 'findHospitals', screen: 'Hospitals'},
    {re: /clinic/, tool: 'findClinics', screen: 'Clinics'},
    {re: /doctor|physician|consult/, tool: 'findDoctors', screen: 'Doctors'},
    {re: /prescription/, tool: 'openPrescriptions', screen: 'Prescriptions'},
    {re: /report/, tool: 'openReports', screen: 'Reports'},
    {re: /health record/, tool: 'openHealthRecords', screen: 'HealthRecords'},
    {re: /order|track/, tool: 'trackOrder', screen: 'Orders'},
    {re: /emergency|ambulance|sos/, tool: 'openEmergency', screen: 'Emergency'},
    {re: /medicine|tablet|syrup/, tool: 'searchMedicine', screen: 'Medicines'},
  ];
  for (const p of pairs) {
    if (p.re.test(t)) {
      return p;
    }
  }
  return {tool: 'findNearbyServices', screen: 'Search', params: {q: text}};
}
