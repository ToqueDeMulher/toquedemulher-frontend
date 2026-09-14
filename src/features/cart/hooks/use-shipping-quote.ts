import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/context/cart-context";
import { quoteShipping } from "@/features/cart/api/shipping-service";

export function useShippingQuote() {
  const { items, setShippingQuote, clearShippingQuote, cartFingerprint } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    sequence.current += 1;
    requestRef.current?.abort();
    setLoading(false);
    setError(null);
    return () => {
      sequence.current += 1;
      requestRef.current?.abort();
    };
  }, [cartFingerprint]);
  async function calculate(postalCode: string) {
    requestRef.current?.abort();
    const run = ++sequence.current;
    if (!/^\d{8}$/.test(postalCode)) {
      setError("Digite um CEP com 8 dígitos.");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    clearShippingQuote();
    setLoading(true);
    setError(null);
    try {
      const quote = await quoteShipping(postalCode, items, controller.signal);
      if (run === sequence.current && !controller.signal.aborted)
        setShippingQuote(quote);
    } catch (error) {
      if (run === sequence.current && !controller.signal.aborted)
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível consultar o frete.",
        );
    } finally {
      if (run === sequence.current) setLoading(false);
    }
  }
  function cancel() {
    sequence.current += 1;
    requestRef.current?.abort();
    setLoading(false);
    setError(null);
  }
  return { calculate, cancel, loading, error };
}
