import { useState, useEffect } from 'react';
import { Order } from '../types';
import { INITIAL_ACTIVE_ORDERS, INITIAL_ORDER_HISTORY } from '../data/mockData';

export function useOrders() {
  const [activeOrders, setActiveOrdersState] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrdersState] = useState<Order[]>([]);

  // Load initially
  useEffect(() => {
    const storedActive = localStorage.getItem('ourfood_active_orders');
    const storedHistory = localStorage.getItem('ourfood_history_orders');

    if (storedActive) {
      try {
        const parsed = JSON.parse(storedActive);
        if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].order_id === undefined) {
          // Old format detected, reset!
          setActiveOrdersState(INITIAL_ACTIVE_ORDERS);
          localStorage.setItem('ourfood_active_orders', JSON.stringify(INITIAL_ACTIVE_ORDERS));
        } else {
          setActiveOrdersState(parsed);
        }
      } catch (e) {
        setActiveOrdersState(INITIAL_ACTIVE_ORDERS);
      }
    } else {
      setActiveOrdersState(INITIAL_ACTIVE_ORDERS);
      localStorage.setItem('ourfood_active_orders', JSON.stringify(INITIAL_ACTIVE_ORDERS));
    }

    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].order_id === undefined) {
          setHistoryOrdersState(INITIAL_ORDER_HISTORY);
          localStorage.setItem('ourfood_history_orders', JSON.stringify(INITIAL_ORDER_HISTORY));
        } else {
          setHistoryOrdersState(parsed);
        }
      } catch(e) {
        setHistoryOrdersState(INITIAL_ORDER_HISTORY);
      }
    } else {
      setHistoryOrdersState(INITIAL_ORDER_HISTORY);
      localStorage.setItem('ourfood_history_orders', JSON.stringify(INITIAL_ORDER_HISTORY));
    }

    // Listen for cross-tab changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ourfood_active_orders' && e.newValue) {
        setActiveOrdersState(JSON.parse(e.newValue));
      }
      if (e.key === 'ourfood_history_orders' && e.newValue) {
        setHistoryOrdersState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setActiveOrders = (newOrders: Order[]) => {
    setActiveOrdersState(newOrders);
    localStorage.setItem('ourfood_active_orders', JSON.stringify(newOrders));
    // dispatch event manually so other components in the same tab update if needed
    window.dispatchEvent(new Event('storage'));
  };

  const setHistoryOrders = (newOrders: Order[]) => {
    setHistoryOrdersState(newOrders);
    localStorage.setItem('ourfood_history_orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('storage'));
  };

  const addOrder = (newOrder: Order) => {
    const updated = [newOrder, ...activeOrders];
    setActiveOrders(updated);
  };

  return {
    activeOrders,
    setActiveOrders,
    historyOrders,
    setHistoryOrders,
    addOrder
  };
}
