import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};

const getItemId = (item) => {
  return item?._id || item?.id || item?.productId || item?.product;
};

const getAvailableStock = (item) => {
  return Number(
    item?.stock ??
      item?.quantity ??
      item?.availableStock ??
      item?.reorderLevel ??
      0
  );
};

const getPrice = (item) => {
  return Number(item?.price ?? item?.sellingPrice ?? item?.unitPrice ?? 0);
};

const showStockMessage = (message) => {
  window.alert(message);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  const addToCart = (product) => {
    const productId = getItemId(product);
    const availableStock = getAvailableStock(product);

    if (!productId) {
      showStockMessage("Invalid product selected.");
      return;
    }

    if (availableStock <= 0) {
      showStockMessage(`${product.name} is out of stock.`);
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => getItemId(item) === productId
      );

      if (existingItem) {
        if (Number(existingItem.qty) >= availableStock) {
          showStockMessage(
            `Only ${availableStock} stock available for ${product.name}.`
          );
          return previousCart;
        }

        return previousCart.map((item) =>
          getItemId(item) === productId
            ? {
                ...item,
                qty: Number(item.qty) + 1,
                stock: availableStock,
                quantity: availableStock,
                availableStock,
                reorderLevel: availableStock,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          _id: productId,
          id: productId,
          qty: 1,
          stock: availableStock,
          quantity: availableStock,
          availableStock,
          reorderLevel: availableStock,
          itemDiscount: 0,
        },
      ];
    });
  };

  const increaseQty = (id) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find((item) => getItemId(item) === id);

      if (!existingItem) return previousCart;

      const availableStock = getAvailableStock(existingItem);

      if (Number(existingItem.qty) >= availableStock) {
        showStockMessage(
          `Only ${availableStock} stock available for ${existingItem.name}.`
        );
        return previousCart;
      }

      return previousCart.map((item) =>
        getItemId(item) === id
          ? {
              ...item,
              qty: Number(item.qty) + 1,
            }
          : item
      );
    });
  };

  const decreaseQty = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          getItemId(item) === id
            ? {
                ...item,
                qty: Number(item.qty) - 1,
              }
            : item
        )
        .filter((item) => Number(item.qty) > 0)
    );
  };

  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => getItemId(item) !== id)
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTaxRate(0);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + getPrice(item) * Number(item.qty || 0);
    }, 0);
  }, [cart]);

  const safeDiscount = useMemo(() => {
    return Math.min(Number(discount || 0), subtotal);
  }, [discount, subtotal]);

  const taxAmount = useMemo(() => {
    return Number(
      (((subtotal - safeDiscount) * Number(taxRate || 0)) / 100).toFixed(2)
    );
  }, [subtotal, safeDiscount, taxRate]);

  const total = useMemo(() => {
    return Number((subtotal - safeDiscount + taxAmount).toFixed(2));
  }, [subtotal, safeDiscount, taxAmount]);

  const validateCartStock = () => {
    for (const item of cart) {
      const availableStock = getAvailableStock(item);

      if (availableStock <= 0) {
        return {
          valid: false,
          message: `${item.name} is out of stock.`,
        };
      }

      if (Number(item.qty) > availableStock) {
        return {
          valid: false,
          message: `${item.name} has only ${availableStock} stock available.`,
        };
      }
    }

    return {
      valid: true,
      message: "",
    };
  };

  const buildCheckoutPayload = (paymentMethod, cashReceived, customerId) => {
    return {
      items: cart.map((item) => ({
        productId: getItemId(item),
        product: getItemId(item),
        name: item.name,
        barcode: item.barcode,
        quantity: Number(item.qty),
        qty: Number(item.qty),
        price: getPrice(item),
        unitPrice: getPrice(item),
        discount: Number(item.itemDiscount || 0),
      })),

      paymentMethod,

      cashReceived:
        paymentMethod === "CASH" ? Number(cashReceived || 0) : undefined,

      customerId: customerId || undefined,

      taxRate: Number(taxRate || 0),
      discountAmount: safeDiscount,
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,

        discount,
        setDiscount,

        taxRate,
        setTaxRate,

        subtotal,
        taxAmount,
        total,

        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,

        validateCartStock,
        buildCheckoutPayload,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};