import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerApi } from '../api/client';
import { useCustomerSession } from './CustomerSessionContext';

const CartContext = createContext(null);

const EMPTY_CART = { items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 };

function normalizeCart(data) {
  const items = (data?.items || []).map((i) => ({
    menuItemId: i.menuItemId,
    name: i.nameSnapshot || i.name,
    price: i.priceSnapshot ?? i.price,
    quantity: i.quantity || 0,
    notes: i.notes || '',
  }));
  const subtotal = data?.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = data?.tax || 0;
  return {
    items,
    subtotal,
    tax,
    total: data?.total ?? subtotal + tax,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export function CartProvider({ children }) {
  const { status } = useCustomerSession();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (status !== 'active') {
      setCart(null);
      return null;
    }
    setLoading(true);
    try {
      const data = await customerApi.getCart();
      const normalized = normalizeCart(data);
      setCart(normalized);
      return normalized;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const syncCart = useCallback(async (nextItems) => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.clearCart();
      for (const item of nextItems) {
        if (item.quantity > 0) {
          await customerApi.addCartItem({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes || '',
          });
        }
      }
      const data = await customerApi.getCart();
      const normalized = normalizeCart(data);
      setCart(normalized);
      return normalized;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (item, quantity = 1, notes = '') => {
    const current = cart?.items || [];
    const existing = current.find((i) => i.menuItemId === item._id);
    let next;
    if (existing) {
      next = current.map((i) =>
        i.menuItemId === item._id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      next = [...current, { menuItemId: item._id, name: item.name, price: item.price, quantity, notes }];
    }
    return syncCart(next);
  }, [cart, syncCart]);

  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    const current = cart?.items || [];
    if (quantity <= 0) {
      const next = current.filter((i) => i.menuItemId !== menuItemId);
      return syncCart(next);
    }
    const next = current.map((i) =>
      i.menuItemId === menuItemId ? { ...i, quantity } : i
    );
    return syncCart(next);
  }, [cart, syncCart]);

  const removeItem = useCallback(async (menuItemId) => {
    const next = (cart?.items || []).filter((i) => i.menuItemId !== menuItemId);
    return syncCart(next);
  }, [cart, syncCart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.clearCart();
      setCart(EMPTY_CART);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, loading, error, fetchCart, addItem, updateQuantity, removeItem, clearCart }}
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