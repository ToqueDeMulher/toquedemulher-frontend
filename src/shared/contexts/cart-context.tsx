import { createContext, useContext, useMemo, useState } from "react";

type CartContextValue = {
  itemCount: number;
  addItem: (quantity?: number) => void;
  reset: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const value = useMemo(
    () => ({
      itemCount,
      addItem: (quantity: number = 1) =>
        setItemCount((prev) => prev + Math.max(quantity, 1)),
      reset: () => setItemCount(0),
    }),
    [itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
