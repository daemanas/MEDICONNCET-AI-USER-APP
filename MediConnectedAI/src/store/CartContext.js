import React, {createContext, useContext, useMemo, useState} from 'react';

const CartContext = createContext();

export function CartProvider({children}) {
  const [items, setItems] = useState({});
  const [shop, setShop] = useState(null);

  const addItem = (med, pharmacy = null) => {
    setShop(prev => prev || pharmacy || null);
    setItems(prev => {
      const next = {...prev};
      const current = next[med.id] || {};
      const qty = (current.qty || 0) + 1;
      const stockLimit = med.stock != null ? Number(med.stock) : null;
      const safeQty = stockLimit != null ? Math.min(qty, stockLimit) : qty;

      next[med.id] = {
        ...med,
        ...current,
        pharmacy: pharmacy || current.pharmacy || next[med.id]?.pharmacy || null,
        qty: safeQty,
      };

      return next;
    });
  };

  const updateQuantity = (medId, delta) => {
    setItems(prev => {
      const next = {...prev};
      const current = next[medId];
      if (!current) {
        return prev;
      }

      const nextQty = (current.qty || 0) + delta;
      const stockLimit = current.stock != null ? Number(current.stock) : null;

      if (nextQty <= 0) {
        delete next[medId];
        return next;
      }

      if (stockLimit != null && nextQty > stockLimit) {
        return prev;
      }

      next[medId] = {...current, qty: nextQty};
      return next;
    });
  };

  const removeItem = (medId) => {
    updateQuantity(medId, -1);
  };

  const deleteItem = (medId) => {
    setItems(prev => {
      const next = {...prev};
      delete next[medId];
      return next;
    });
  };

  const clearCart = () => {
    setItems({});
    setShop(null);
  };

  const total = useMemo(
    () => Object.values(items).reduce((acc, item) => acc + Number(item.unitPrice || item.price || 0) * Number(item.qty || 0), 0),
    [items],
  );

  const count = useMemo(
    () => Object.values(items).reduce((acc, item) => acc + Number(item.qty || 0), 0),
    [items],
  );

  return (
    <CartContext.Provider value={{items, shop, setShop, addItem, removeItem, updateQuantity, deleteItem, clearCart, total, count}}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
