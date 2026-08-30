/** Exact statuses from the shared MediConnected backend (PATIENT_ORDER_STATUS). */
export const PATIENT_ORDER_STATUS = [
  'PENDING',
  'REQUESTED',
  'PHARMACY_REVIEWING',
  'ACCEPTED',
  'PARTIALLY_AVAILABLE',
  'REJECTED',
  'ORDER_CONFIRMED',
  'PREPARING',
  'READY',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COLLECTED',
  'COMPLETED',
  'CANCELLED',
];

export const ORDER_LABEL = {
  PENDING: 'Pending',
  REQUESTED: 'Requested',
  PHARMACY_REVIEWING: 'Pharmacy reviewing',
  ACCEPTED: 'Accepted',
  PARTIALLY_AVAILABLE: 'Partially available',
  REJECTED: 'Rejected',
  ORDER_CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  READY_FOR_PICKUP: 'Ready for pickup',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  COLLECTED: 'Collected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const CANCELLABLE = ['PENDING', 'REQUESTED', 'PHARMACY_REVIEWING'];
