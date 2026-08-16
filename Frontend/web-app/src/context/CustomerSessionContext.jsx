import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  customerApi,
  restoreSessionToken,
  clearSessionToken,
  setUnauthorizedHandler,
  getSessionToken,
} from '../api/client';

const CustomerSessionContext = createContext(null);

export function CustomerSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | active | inactive
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeSession = useCallback(async () => {
    restoreSessionToken();
    const token = getSessionToken();
    if (!token) {
      setStatus('inactive');
      return;
    }
    try {
      const data = await customerApi.getMenu();
      setSession(data.session);
      setStatus('active');
    } catch {
      clearSessionToken();
      setStatus('inactive');
    }
  }, []);

  useEffect(() => {
    initializeSession();

    setUnauthorizedHandler(() => {
      clearSessionToken();
      setSession(null);
      setStatus('inactive');
    });
  }, [initializeSession]);

  const scanSession = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.scanSession(payload);
      sessionStorage.setItem('orderxpress.customer.sessionToken', data.sessionToken);
      setSession(data.session);
      setStatus('active');
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(async () => {
    clearSessionToken();
    setSession(null);
    setStatus('inactive');
  }, []);

  return (
    <CustomerSessionContext.Provider
      value={{ session, status, loading, error, scanSession, clearSession }}
    >
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession() {
  const ctx = useContext(CustomerSessionContext);
  if (!ctx) throw new Error('useCustomerSession must be used inside <CustomerSessionProvider>');
  return ctx;
}