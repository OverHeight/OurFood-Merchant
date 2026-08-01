// Deprecated hook — driver assignment is now handled via Supabase Realtime in useOrders
export function useDriverRequests() {
  return {
    currentRequest: null,
    acceptRequest: () => {},
    rejectRequest: () => {},
    dismissRequest: () => {},
  };
}
