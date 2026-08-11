"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  /**
   * Display price only — captured for the UI. The order total and each
   * line's actual charged price are always recomputed server-side from the
   * live `product_variants` table when the order is created, so a
   * manipulated localStorage price can never affect what gets billed.
   */
  displayPriceAgorot: number | null;
  imageUrl: string | null;
  ageRestricted: boolean;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotalAgorot: number;
  hasAgeRestrictedItem: boolean;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "terminal3-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // One-time sync from localStorage (an external system) on mount. Starting
  // from an empty array on both server and first client render avoids a
  // hydration mismatch; the cart then "fills in" a frame later.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, an external system, is the intended use of this effect
    setLines(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotalAgorot = lines.reduce(
      (sum, l) => sum + (l.displayPriceAgorot ?? 0) * l.quantity,
      0,
    );
    const hasAgeRestrictedItem = lines.some((l) => l.ageRestricted);

    return {
      lines,
      itemCount,
      subtotalAgorot,
      hasAgeRestrictedItem,
      addItem: (line, quantity = 1) => {
        setLines((prev) => {
          const existing = prev.find((l) => l.variantId === line.variantId);
          if (existing) {
            return prev.map((l) =>
              l.variantId === line.variantId
                ? { ...l, quantity: l.quantity + quantity }
                : l,
            );
          }
          return [...prev, { ...line, quantity }];
        });
      },
      updateQuantity: (variantId, quantity) => {
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => l.variantId !== variantId)
            : prev.map((l) =>
                l.variantId === variantId ? { ...l, quantity } : l,
              ),
        );
      },
      removeItem: (variantId) => {
        setLines((prev) => prev.filter((l) => l.variantId !== variantId));
      },
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
