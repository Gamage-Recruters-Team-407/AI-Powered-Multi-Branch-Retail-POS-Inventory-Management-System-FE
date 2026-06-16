import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0); // flat discount on total (Rs.)
  const [taxRate, setTaxRate] = useState(0);   // percentage, e.g. 8

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1, itemDiscount: 0 }];
    });
  };

  const increaseQty = (id) =>
    setCart((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: i.qty + 1 } : i))
    );

  const decreaseQty = (id) =>
    setCart((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTaxRate(0);
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const taxAmount = useMemo(
    () => parseFloat(((subtotal - discount) * taxRate / 100).toFixed(2)),
    [subtotal, discount, taxRate]
  );

  const total = useMemo(
    () => parseFloat((subtotal - discount + taxAmount).toFixed(2)),
    [subtotal, discount, taxAmount]
  );

  // Build payload for API
  const buildCheckoutPayload = (paymentMethod, cashReceived, customerId) => ({
    items: cart.map((i) => ({
      productId: i._id,
      quantity: i.qty,
      discount: i.itemDiscount || 0,
    })),
    paymentMethod,
    cashReceived: paymentMethod === "CASH" ? cashReceived : undefined,
    customerId: customerId || undefined,
    taxRate,
    discountAmount: discount,
  });

  return (
    <CartContext.Provider
      value={{
        cart,
        discount, setDiscount,
        taxRate, setTaxRate,
        subtotal,
        taxAmount,
        total,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        buildCheckoutPayload,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
