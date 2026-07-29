import { useState } from 'react';
import { DriverRequest } from '../types';
import { MOCK_DRIVER_REQUESTS } from '../data/mockData';

export function useDriverRequests() {
  const [pendingRequests, setPendingRequests] = useState<DriverRequest[]>(MOCK_DRIVER_REQUESTS);

  const acceptRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    // In production: update DB, notify driver
  };

  const rejectRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    // In production: notify driver of rejection
  };

  const dismissRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId));
  };

  const currentRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  return {
    currentRequest,
    acceptRequest,
    rejectRequest,
    dismissRequest,
  };
}
