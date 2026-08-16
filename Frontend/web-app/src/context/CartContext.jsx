import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerApi } from '../api/client';
import { useCustomerSession } from './CustomerSessionContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { status } = useCustomerSession();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (status !== 'active') {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await customerApi.getCart();
      setCart(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (menuItemId, quantity = 1, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.addCartItem({ menuItemId, quantity, notes });
      setCart(data);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (menuItemId) => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.addCartItem({ menuItemId, quantity: 0 });
      await fetchCart();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    if (quantity <= 0) return removeItem(menuItemId);
    return addItem(menuItemId, quantity);
  }, [addItem, removeItem]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.clearCart();
      setCart({ items: [], totalAmount: 0, itemCount: 0 });
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, loading, error, fetchCart, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}